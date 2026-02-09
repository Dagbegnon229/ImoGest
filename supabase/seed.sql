-- ============================================================
-- ImmoGest Seed Data
-- Run this AFTER schema.sql
-- ============================================================

-- ============================================================
-- 1. ADMINS (no FK dependencies)
-- ============================================================
INSERT INTO admins (id, first_name, last_name, email, phone, role, password, is_active, created_at, created_by) VALUES
('ADM-0001', 'Super', 'Admin', 'superadmin@immogest.ca', '514-000-0001', 'super_admin', 'Admin@2026!', true, '2025-01-01T00:00:00Z', NULL),
('ADM-0010', 'Karim', 'Benchekroun', 'karim.benchekroun@immogest.ca', '514-000-0010', 'admin_manager', 'Manager@2026!', true, '2025-03-15T10:30:00Z', 'ADM-0001'),
('ADM-0100', 'Sara', 'Alaoui', 'sara.alaoui@immogest.ca', '514-000-0100', 'admin_support', 'Support@2026!', true, '2025-06-01T08:00:00Z', 'ADM-0001');

-- ============================================================
-- 2. BUILDINGS (manager_id references admins)
-- ============================================================
INSERT INTO buildings (id, name, address, city, province, postal_code, total_units, occupied_units, floors, year_built, manager_id, created_at) VALUES
('BLD-001', 'Résidence Al Amal', '456 Rue Sherbrooke', 'Montréal', 'QC', 'H2L 1J6', 24, 20, 3, 2010, 'ADM-0010', '2025-01-15T09:00:00Z'),
('BLD-002', 'Tour Casablanca', '789 Boulevard René-Lévesque', 'Montréal', 'QC', 'H3B 1H7', 48, 42, 12, 2018, 'ADM-0010', '2025-02-01T10:00:00Z'),
('BLD-003', 'Immeuble Rabat', '321 Avenue du Parc', 'Montréal', 'QC', 'H2V 4E7', 18, 15, 4, 2005, 'ADM-0100', '2025-02-15T11:00:00Z'),
('BLD-004', 'Villa Marrakech', '654 Rue Saint-Denis', 'Montréal', 'QC', 'H2J 2L3', 8, 7, 2, 2000, 'ADM-0100', '2025-03-01T08:30:00Z'),
('BLD-005', 'Résidence Atlas', '987 Rue Sainte-Catherine', 'Montréal', 'QC', 'H3B 1B7', 36, 30, 8, 2022, 'ADM-0010', '2025-04-01T09:00:00Z');

-- ============================================================
-- 3. APARTMENTS (tenant_id set to NULL initially)
-- ============================================================
INSERT INTO apartments (id, building_id, unit_number, floor, rooms, area, rent, status, tenant_id) VALUES
('APT-001', 'BLD-001', '101',  1, 3, 75,  1200, 'occupied',    NULL),
('APT-002', 'BLD-001', '102',  1, 2, 55,   950, 'available',   NULL),
('APT-003', 'BLD-001', '201',  2, 4, 90,  1450, 'occupied',    NULL),
('APT-004', 'BLD-002', '301',  3, 2, 60,  1100, 'maintenance', NULL),
('APT-005', 'BLD-002', '502',  5, 3, 80,  1350, 'occupied',    NULL),
('APT-006', 'BLD-002', '1001', 10, 5, 120, 2200, 'available',  NULL),
('APT-007', 'BLD-003', '201',  2, 2, 58,   980, 'available',   NULL),
('APT-008', 'BLD-003', '302',  3, 3, 72,  1150, 'occupied',    NULL),
('APT-009', 'BLD-004', '101',  1, 2, 50,   850, 'maintenance', NULL),
('APT-010', 'BLD-004', '102',  1, 3, 68,  1050, 'occupied',    NULL),
('APT-011', 'BLD-005', '401',  4, 4, 95,  1600, 'available',   NULL),
('APT-012', 'BLD-005', '702',  7, 3, 78,  1400, 'available',   NULL);

-- ============================================================
-- 4. TENANTS (lease_id set to NULL initially)
-- ============================================================
INSERT INTO tenants (id, first_name, last_name, email, phone, password, status, building_id, apartment_id, lease_id, must_change_password, created_at, created_by) VALUES
('CLT-2026-0001', 'Ahmed',   'Benali',    'ahmed.benali@email.com',       '514-111-0001', 'Client@2026!', 'active',   'BLD-001', 'APT-001', NULL, false, '2025-06-01T10:00:00Z', 'ADM-0010'),
('CLT-2026-0002', 'Fatima',  'Zahra',     'fatima.zahra@email.com',       '514-111-0002', 'Client@2026!', 'active',   'BLD-002', 'APT-005', NULL, false, '2025-07-15T14:00:00Z', 'ADM-0010'),
('CLT-2026-0003', 'Youssef', 'Amrani',    'youssef.amrani@email.com',     '514-111-0003', 'Client@2026!', 'active',   'BLD-003', 'APT-008', NULL, false, '2025-08-01T09:30:00Z', 'ADM-0100'),
('CLT-2026-0004', 'Khadija', 'Moussaoui', 'khadija.moussaoui@email.com',  '514-111-0004', 'Client@2026!', 'active',   'BLD-004', 'APT-010', NULL, false, '2025-09-01T11:00:00Z', 'ADM-0100'),
('CLT-2026-0005', 'Omar',    'Tazi',      'omar.tazi@email.com',          '514-111-0005', 'Client@2026!', 'active',   'BLD-001', 'APT-003', NULL, false, '2025-10-01T08:00:00Z', 'ADM-0010'),
('CLT-2026-0006', 'Nadia',   'Berrada',   'nadia.berrada@email.com',      '514-111-0006', 'Client@2026!', 'inactive', NULL,      NULL,      NULL, false, '2025-05-01T16:00:00Z', 'ADM-0010');

-- ============================================================
-- 5. UPDATE apartments SET tenant_id for occupied apartments
-- ============================================================
UPDATE apartments SET tenant_id = 'CLT-2026-0001' WHERE id = 'APT-001';
UPDATE apartments SET tenant_id = 'CLT-2026-0005' WHERE id = 'APT-003';
UPDATE apartments SET tenant_id = 'CLT-2026-0002' WHERE id = 'APT-005';
UPDATE apartments SET tenant_id = 'CLT-2026-0003' WHERE id = 'APT-008';
UPDATE apartments SET tenant_id = 'CLT-2026-0004' WHERE id = 'APT-010';

-- ============================================================
-- 6. LEASES
-- ============================================================
INSERT INTO leases (id, tenant_id, apartment_id, building_id, start_date, end_date, monthly_rent, deposit_amount, status, created_at, created_by) VALUES
('LSE-001', 'CLT-2026-0001', 'APT-001', 'BLD-001', '2025-07-01', '2026-06-30', 1200, 1200, 'active', '2025-06-15T10:00:00Z', 'ADM-0010'),
('LSE-002', 'CLT-2026-0002', 'APT-005', 'BLD-002', '2025-08-01', '2026-07-31', 1350, 1350, 'active', '2025-07-20T14:00:00Z', 'ADM-0010'),
('LSE-003', 'CLT-2026-0003', 'APT-008', 'BLD-003', '2025-09-01', '2026-08-31', 1150, 1150, 'active', '2025-08-15T09:30:00Z', 'ADM-0100'),
('LSE-004', 'CLT-2026-0004', 'APT-010', 'BLD-004', '2025-10-01', '2026-09-30', 1050, 1050, 'active', '2025-09-15T11:00:00Z', 'ADM-0100'),
('LSE-005', 'CLT-2026-0005', 'APT-003', 'BLD-001', '2025-11-01', '2026-10-31', 1450, 1450, 'active', '2025-10-15T08:00:00Z', 'ADM-0010');

-- ============================================================
-- 7. UPDATE tenants SET lease_id for those with leases
-- ============================================================
UPDATE tenants SET lease_id = 'LSE-001' WHERE id = 'CLT-2026-0001';
UPDATE tenants SET lease_id = 'LSE-002' WHERE id = 'CLT-2026-0002';
UPDATE tenants SET lease_id = 'LSE-003' WHERE id = 'CLT-2026-0003';
UPDATE tenants SET lease_id = 'LSE-004' WHERE id = 'CLT-2026-0004';
UPDATE tenants SET lease_id = 'LSE-005' WHERE id = 'CLT-2026-0005';

-- ============================================================
-- 8. INCIDENTS
-- ============================================================
INSERT INTO incidents (id, title, description, building_id, apartment_id, reported_by, assigned_to, status, priority, created_at, resolved_at) VALUES
('INC-001', 'Fuite d''eau dans la salle de bain', 'Une fuite d''eau importante a été détectée sous le lavabo de la salle de bain. Le sol est mouillé et il y a risque de dégât des eaux.', 'BLD-001', 'APT-001', 'CLT-2026-0001', 'ADM-0100', 'in_progress', 'high', '2026-01-20T08:30:00Z', NULL),
('INC-002', 'Chauffage défectueux', 'Le chauffage ne fonctionne plus dans le salon depuis deux jours. La température intérieure est en baisse.', 'BLD-002', 'APT-005', 'CLT-2026-0002', 'ADM-0100', 'new', 'urgent', '2026-02-01T10:00:00Z', NULL),
('INC-003', 'Serrure de porte endommagée', 'La serrure de la porte d''entrée de l''appartement est difficile à tourner et risque de se bloquer.', 'BLD-003', 'APT-008', 'CLT-2026-0003', NULL, 'new', 'medium', '2026-02-03T14:15:00Z', NULL),
('INC-004', 'Bruit excessif des voisins', 'Des bruits excessifs proviennent de l''appartement du dessus régulièrement après 22h, perturbant le sommeil.', 'BLD-001', 'APT-003', 'CLT-2026-0005', 'ADM-0010', 'in_progress', 'low', '2026-01-25T20:00:00Z', NULL),
('INC-005', 'Ascenseur en panne', 'L''ascenseur principal de l''immeuble est hors service depuis ce matin. Les résidents des étages supérieurs sont fortement impactés.', 'BLD-002', 'APT-005', 'CLT-2026-0002', 'ADM-0010', 'in_progress', 'urgent', '2026-02-05T07:45:00Z', NULL),
('INC-006', 'Infiltration d''eau au plafond', 'Une tache d''humidité est apparue au plafond de la chambre. Elle semble s''agrandir progressivement.', 'BLD-004', 'APT-010', 'CLT-2026-0004', 'ADM-0100', 'resolved', 'high', '2026-01-10T09:00:00Z', '2026-01-18T16:30:00Z'),
('INC-007', 'Prise électrique défaillante', 'Une prise électrique dans la cuisine produit des étincelles lorsqu''on branche un appareil. Risque d''incendie.', 'BLD-003', 'APT-008', 'CLT-2026-0003', NULL, 'new', 'high', '2026-02-07T11:30:00Z', NULL);

-- ============================================================
-- 9. PENDING APPLICATIONS
-- ============================================================
INSERT INTO pending_applications (id, first_name, last_name, email, phone, password, housing_preference, documents, status, reviewed_by, review_note, submitted_at, reviewed_at) VALUES
('APP-0001', 'Rachid', 'El Fassi', 'rachid.elfassi@email.com', '514-222-0001', 'Applicant@2026!', '3 pièces, Résidence Al Amal ou Tour Casablanca', ARRAY['piece_identite.pdf', 'releve_emploi.pdf', 'preuve_revenu.pdf'], 'pending_review', NULL, NULL, '2026-02-01T09:00:00Z', NULL),
('APP-0002', 'Samira', 'Benhaddou', 'samira.benhaddou@email.com', '514-222-0002', 'Applicant@2026!', '2 pièces, budget maximum 1000$/mois', ARRAY['carte_residence.pdf', 'contrat_travail.pdf'], 'pending_review', NULL, NULL, '2026-02-03T14:30:00Z', NULL),
('APP-0003', 'Mehdi', 'Chraibi', 'mehdi.chraibi@email.com', '514-222-0003', 'Applicant@2026!', '4 pièces, Résidence Atlas de préférence', ARRAY['passeport.pdf', 'avis_imposition.pdf', 'lettre_employeur.pdf', 'releve_bancaire.pdf'], 'pending_review', NULL, NULL, '2026-02-06T11:15:00Z', NULL);

-- ============================================================
-- 10. PAYMENTS
-- ============================================================
INSERT INTO payments (id, tenant_id, lease_id, amount, monthly_rent, month, due_date, paid_at, status, method, reference, late_fee, created_at) VALUES
-- CLT-2026-0001 / LSE-001
('PAY-001', 'CLT-2026-0001', 'LSE-001', 6500, 6500, '2025-10', '2025-10-01', '2025-09-28T10:30:00Z', 'completed', 'bank_transfer', 'VIR-2025-10-001', 0, '2025-09-25T08:00:00Z'),
('PAY-002', 'CLT-2026-0001', 'LSE-001', 6500, 6500, '2025-11', '2025-11-01', '2025-10-30T14:15:00Z', 'completed', 'bank_transfer', 'VIR-2025-11-001', 0, '2025-10-25T08:00:00Z'),
('PAY-003', 'CLT-2026-0001', 'LSE-001', 6500, 6500, '2025-12', '2025-12-01', '2025-11-29T09:45:00Z', 'completed', 'bank_transfer', 'VIR-2025-12-001', 0, '2025-11-25T08:00:00Z'),
('PAY-004', 'CLT-2026-0001', 'LSE-001', 6500, 6500, '2026-01', '2026-01-01', '2025-12-29T11:00:00Z', 'completed', 'bank_transfer', 'VIR-2026-01-001', 0, '2025-12-25T08:00:00Z'),
('PAY-005', 'CLT-2026-0001', 'LSE-001', 6500, 6500, '2026-02', '2026-02-01', NULL,                    'pending',   NULL,            NULL,              0, '2026-01-25T08:00:00Z'),
-- CLT-2026-0002 / LSE-002
('PAY-006', 'CLT-2026-0002', 'LSE-002', 7200, 7200, '2025-10', '2025-10-01', '2025-10-03T16:20:00Z', 'completed', 'cheque',        'CHQ-2025-10-002', 0,   '2025-09-25T08:00:00Z'),
('PAY-007', 'CLT-2026-0002', 'LSE-002', 7560, 7200, '2025-11', '2025-11-01', '2025-11-08T10:00:00Z', 'completed', 'cash',          'ESP-2025-11-002', 360, '2025-10-25T08:00:00Z'),
('PAY-008', 'CLT-2026-0002', 'LSE-002', 7200, 7200, '2025-12', '2025-12-01', '2025-12-01T09:30:00Z', 'completed', 'bank_transfer', 'VIR-2025-12-002', 0,   '2025-11-25T08:00:00Z'),
('PAY-009', 'CLT-2026-0002', 'LSE-002', 7560, 7200, '2026-01', '2026-01-01', '2026-01-06T15:45:00Z', 'completed', 'cheque',        'CHQ-2026-01-002', 360, '2025-12-25T08:00:00Z'),
('PAY-010', 'CLT-2026-0002', 'LSE-002', 7200, 7200, '2026-02', '2026-02-01', NULL,                    'pending',   NULL,            NULL,              0,   '2026-01-25T08:00:00Z'),
-- CLT-2026-0003 / LSE-003
('PAY-011', 'CLT-2026-0003', 'LSE-003', 5800, 5800, '2025-10', '2025-10-01', '2025-09-30T17:00:00Z', 'completed', 'credit_card',   'CB-2025-10-003',  0,   '2025-09-25T08:00:00Z'),
('PAY-012', 'CLT-2026-0003', 'LSE-003', 5800, 5800, '2025-11', '2025-11-01', '2025-10-29T12:00:00Z', 'completed', 'credit_card',   'CB-2025-11-003',  0,   '2025-10-25T08:00:00Z'),
('PAY-013', 'CLT-2026-0003', 'LSE-003', 6090, 5800, '2025-12', '2025-12-01', '2025-12-05T14:30:00Z', 'completed', 'bank_transfer', 'VIR-2025-12-003', 290, '2025-11-25T08:00:00Z'),
('PAY-014', 'CLT-2026-0003', 'LSE-003', 5800, 5800, '2026-01', '2026-01-01', '2025-12-28T10:15:00Z', 'completed', 'credit_card',   'CB-2026-01-003',  0,   '2025-12-25T08:00:00Z'),
('PAY-015', 'CLT-2026-0003', 'LSE-003', 5800, 5800, '2026-02', '2026-02-01', NULL,                    'pending',   NULL,            NULL,              0,   '2026-01-25T08:00:00Z');

-- ============================================================
-- 11. POINTS TRANSACTIONS
-- ============================================================
INSERT INTO points_transactions (id, tenant_id, type, points, description, related_payment_id, created_at) VALUES
-- CLT-2026-0001
('PTS-001', 'CLT-2026-0001', 'earned_early_payment', 50,  'Paiement anticipé - Octobre 2025',              'PAY-001', '2025-09-28T10:30:00Z'),
('PTS-002', 'CLT-2026-0001', 'earned_early_payment', 50,  'Paiement anticipé - Novembre 2025',             'PAY-002', '2025-10-30T14:15:00Z'),
('PTS-003', 'CLT-2026-0001', 'earned_early_payment', 50,  'Paiement anticipé - Décembre 2025',             'PAY-003', '2025-11-29T09:45:00Z'),
('PTS-004', 'CLT-2026-0001', 'earned_early_payment', 50,  'Paiement anticipé - Janvier 2026',              'PAY-004', '2025-12-29T11:00:00Z'),
('PTS-005', 'CLT-2026-0001', 'earned_loyalty',       100, 'Bonus de fidélité - 6 mois consécutifs',        NULL,      '2026-01-01T00:00:00Z'),
('PTS-006', 'CLT-2026-0001', 'earned_no_incident',   25,  'Aucun incident signalé - Trimestre Q4 2025',    NULL,      '2026-01-01T00:00:00Z'),
-- CLT-2026-0002
('PTS-007', 'CLT-2026-0002', 'earned_on_time',       30,  'Paiement à temps - Octobre 2025',               'PAY-006', '2025-10-03T16:20:00Z'),
('PTS-008', 'CLT-2026-0002', 'earned_on_time',       30,  'Paiement à temps - Décembre 2025',              'PAY-008', '2025-12-01T09:30:00Z'),
('PTS-009', 'CLT-2026-0002', 'earned_loyalty',       100, 'Bonus de fidélité - 6 mois de location',        NULL,      '2026-01-15T00:00:00Z'),
('PTS-010', 'CLT-2026-0002', 'earned_no_incident',   25,  'Aucun incident signalé - Trimestre Q4 2025',    NULL,      '2026-01-01T00:00:00Z'),
-- CLT-2026-0003
('PTS-011', 'CLT-2026-0003', 'earned_on_time',       30,  'Paiement à temps - Octobre 2025',               'PAY-011', '2025-09-30T17:00:00Z'),
('PTS-012', 'CLT-2026-0003', 'earned_early_payment', 50,  'Paiement anticipé - Novembre 2025',             'PAY-012', '2025-10-29T12:00:00Z'),
('PTS-013', 'CLT-2026-0003', 'earned_early_payment', 50,  'Paiement anticipé - Janvier 2026',              'PAY-014', '2025-12-28T10:15:00Z'),
('PTS-014', 'CLT-2026-0003', 'earned_loyalty',       100, 'Bonus de fidélité - 4 mois consécutifs à temps', NULL,     '2026-01-05T00:00:00Z'),
('PTS-015', 'CLT-2026-0003', 'earned_no_incident',   25,  'Aucun incident signalé - Trimestre Q4 2025',    NULL,      '2026-01-01T00:00:00Z');

-- ============================================================
-- 12. LOYALTY PROFILES
-- ============================================================
INSERT INTO loyalty_profiles (tenant_id, total_points, current_tier, punctuality_score, consecutive_on_time, total_payments, on_time_payments) VALUES
('CLT-2026-0001', 850, 'gold',   95, 4, 4, 4),
('CLT-2026-0002', 450, 'silver', 75, 1, 4, 2),
('CLT-2026-0003', 700, 'gold',   88, 2, 4, 3);

-- ============================================================
-- 13. CONVERSATIONS
-- ============================================================
INSERT INTO conversations (id, tenant_id, admin_id, subject, last_message_at, unread_admin, unread_client, created_at) VALUES
('CONV-001', 'CLT-2026-0001', 'ADM-0001', 'Demande de maintenance - Fuite robinet cuisine', '2026-01-20T16:45:00Z', 1, 0, '2026-01-18T09:00:00Z'),
('CONV-002', 'CLT-2026-0002', 'ADM-0010', 'Question sur le renouvellement du bail',         '2026-01-22T11:30:00Z', 0, 1, '2026-01-20T14:00:00Z');

-- ============================================================
-- 14. MESSAGES
-- ============================================================
INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, read_at, created_at) VALUES
-- Conversation 1
('MSG-001', 'CONV-001', 'CLT-2026-0001', 'client', 'Bonjour, je souhaite signaler une fuite au niveau du robinet de la cuisine. L''eau coule en permanence même lorsque le robinet est fermé. Pourriez-vous envoyer un technicien rapidement ?', '2026-01-18T09:30:00Z', '2026-01-18T09:00:00Z'),
('MSG-002', 'CONV-001', 'ADM-0001',      'admin',  'Bonjour M. Benali. Merci de nous avoir informés. Nous allons planifier l''intervention d''un plombier dans les 48 heures. Pouvez-vous nous confirmer vos disponibilités cette semaine ?', '2026-01-18T14:00:00Z', '2026-01-18T10:15:00Z'),
('MSG-003', 'CONV-001', 'CLT-2026-0001', 'client', 'Merci pour votre réactivité. Je suis disponible mercredi et jeudi matin entre 9h et 12h. En attendant, j''ai placé un seau sous le robinet pour limiter les dégâts.', '2026-01-19T08:00:00Z', '2026-01-18T14:30:00Z'),
('MSG-004', 'CONV-001', 'ADM-0001',      'admin',  'Parfait. Le plombier passera mercredi 22 janvier à 10h. Il vous contactera 30 minutes avant son arrivée. N''hésitez pas à nous prévenir si la situation s''aggrave.', '2026-01-20T09:00:00Z', '2026-01-19T09:00:00Z'),
('MSG-005', 'CONV-001', 'CLT-2026-0001', 'client', 'C''est noté, merci beaucoup. Je serai présent mercredi matin pour accueillir le plombier.', NULL, '2026-01-20T16:45:00Z'),
-- Conversation 2
('MSG-006', 'CONV-002', 'CLT-2026-0002', 'client', 'Bonjour, mon bail arrive à échéance le 31 juillet 2026. Je souhaiterais savoir quelles sont les conditions pour le renouvellement et s''il y aura une révision du loyer.', '2026-01-20T15:00:00Z', '2026-01-20T14:00:00Z'),
('MSG-007', 'CONV-002', 'ADM-0010',      'admin',  'Bonjour Mme Zahra. Merci pour votre anticipation. Le renouvellement est tout à fait possible. Nous vous enverrons une proposition de renouvellement avec les nouvelles conditions 3 mois avant l''échéance, soit en avril 2026.', '2026-01-21T08:00:00Z', '2026-01-20T16:30:00Z'),
('MSG-008', 'CONV-002', 'CLT-2026-0002', 'client', 'D''accord, merci pour ces précisions. Est-ce que le loyer risque d''augmenter significativement ? Je voudrais pouvoir anticiper mon budget.', '2026-01-21T14:00:00Z', '2026-01-21T10:00:00Z'),
('MSG-009', 'CONV-002', 'ADM-0010',      'admin',  'La révision du loyer suit l''indice de référence des loyers en vigueur. L''ajustement sera raisonnable et conforme à la réglementation. Vous recevrez tous les détails dans la proposition formelle. En tant que locataire fidèle, vous bénéficierez de conditions avantageuses.', NULL, '2026-01-22T11:30:00Z');

-- ============================================================
-- 15. DOCUMENTS
-- ============================================================
INSERT INTO documents (id, tenant_id, type, title, description, file_url, file_size, uploaded_by, created_at) VALUES
('DOC-001', 'CLT-2026-0001', 'lease_contract', 'Contrat de bail - APT-001', 'Contrat de location signé pour l''appartement APT-001 dans l''immeuble Résidence Al Andalous. Durée : 12 mois à compter du 01/07/2025.', '/documents/CLT-2026-0001/contrat-bail-apt001.pdf', 245760, 'ADM-0010', '2025-06-15T10:00:00Z'),
('DOC-002', 'CLT-2026-0001', 'receipt',        'Quittance de loyer - Janvier 2026', 'Quittance de loyer pour le mois de janvier 2026. Montant : 6 500 MAD. Paiement reçu le 29/12/2025.', '/documents/CLT-2026-0001/quittance-janvier-2026.pdf', 102400, 'ADM-0010', '2026-01-02T08:00:00Z'),
('DOC-003', 'CLT-2026-0002', 'lease_contract', 'Contrat de bail - APT-005', 'Contrat de location signé pour l''appartement APT-005 dans l''immeuble Résidence Les Palmiers. Durée : 12 mois à compter du 01/08/2025.', '/documents/CLT-2026-0002/contrat-bail-apt005.pdf', 251904, 'ADM-0010', '2025-07-20T14:00:00Z'),
('DOC-004', 'CLT-2026-0002', 'notice',         'Avis de retard de paiement - Novembre 2025', 'Avis de retard pour le loyer du mois de novembre 2025. Pénalité de retard appliquée : 360 MAD. Paiement reçu le 08/11/2025.', '/documents/CLT-2026-0002/avis-retard-novembre-2025.pdf', 87040, 'ADM-0010', '2025-11-05T09:00:00Z'),
('DOC-005', 'CLT-2026-0003', 'lease_contract', 'Contrat de bail - APT-008', 'Contrat de location signé pour l''appartement APT-008 dans l''immeuble Résidence Le Jardin. Durée : 12 mois à compter du 01/09/2025.', '/documents/CLT-2026-0003/contrat-bail-apt008.pdf', 239616, 'ADM-0100', '2025-08-15T09:30:00Z'),
('DOC-006', 'CLT-2026-0003', 'invoice',        'Facture charges communes - Q4 2025', 'Facture des charges communes pour le quatrième trimestre 2025. Comprend l''entretien des parties communes, ascenseur et gardiennage.', '/documents/CLT-2026-0003/facture-charges-q4-2025.pdf', 153600, 'ADM-0100', '2026-01-10T11:00:00Z');
