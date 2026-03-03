-- Script para promover contas a Super Administradores
-- Você deve rodar este script no painel "SQL Editor" do Supremo (Supabase)

UPDATE public."Profile"
SET 
  is_super_admin = true,
  -- max_weddings não importa para Super Admins pois a função os ignora, mas por precaução:
  max_weddings = 999 
WHERE email IN (
  'resper@gmail.com',
  'resper@ness.com.br',
  'resper@bekaa.eu'
);

-- Para verificar quem sâo os super admins atuais:
-- SELECT email, is_super_admin FROM public."Profile" WHERE is_super_admin = true;
