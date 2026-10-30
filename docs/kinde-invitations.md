# Kinde organization invitations

The Team page sends invitations through Kinde's Management API. Kinde remains
responsible for validating the invitation and sending its invitation email;
the app does not create a substitute invitation code.

## Kinde setup

1. In **Settings → Environment → Policies**, enable **Allow invitations** and
   select the LINK application as the invite application. Make sure its
   application login URI is configured.
2. In **Organizations**, copy the code for the LINK organization.
3. Create a separate **Machine to machine (M2M)** application and authorize it
   for the Kinde Management API. Enable the invitation creation scope shown for
   the organization invites endpoint (`create:organization_invites`).
4. Add these server-only variables to the local runtime or deployment settings:

   - `KINDE_M2M_CLIENT_ID`
   - `KINDE_M2M_CLIENT_SECRET`
   - `KINDE_ORG_CODE`
   - `KINDE_DEFAULT_INVITE_ROLE` (optional; defaults to `member`)

   The code uses the existing `KINDE_ISSUER_URL` to find the Kinde API host.
   Keep the M2M secret on the server and never prefix it with `NEXT_PUBLIC_`.

The signed-in LINK account must have the app-level `admin` role to see or submit
the invite form. To bootstrap the first inviter without changing their other
app permissions, set `LINK_TEAM_ADMIN_EMAIL` to that account's email in the
server environment. New invitees receive the Kinde `member` role by default and
are created as LINK team members when they accept the invitation and sign in.
