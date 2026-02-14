import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY non configurée" },
        { status: 500 }
      );
    }
    const resend = new Resend(apiKey);

    const { to, applicantName, reason } = await request.json();

    if (!to || !applicantName || !reason) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0f1b2d; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">ImoGest</h1>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <p style="color: #171717; font-size: 16px;">Bonjour ${applicantName},</p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Nous vous remercions pour votre demande de logement soumise sur notre plateforme ImoGest.
          </p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Après examen attentif de votre dossier, nous avons le regret de vous informer que votre demande n'a pas pu être retenue.
          </p>
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <p style="color: #991b1b; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Motif :</p>
            <p style="color: #171717; font-size: 14px; margin: 0;">${reason}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Vous pouvez soumettre une nouvelle demande si votre situation change. N'hésitez pas à nous contacter pour toute question.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Cordialement,<br/>
            <strong style="color: #171717;">L'équipe ImoGest</strong>
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
          Ce courriel a été envoyé automatiquement. Veuillez ne pas y répondre.
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "ImoGest <onboarding@resend.dev>",
      to: [to],
      subject: "ImoGest - Résultat de votre demande de logement",
      html: htmlContent,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
