import "server-only";

type KindeTokenResponse = {
  access_token?: string;
};

/** Create a real Kinde organization invite without exposing M2M credentials. */
export async function sendKindeOrganizationInvite(email: string) {
  const issuerUrl = process.env.KINDE_ISSUER_URL;
  const clientId = process.env.KINDE_M2M_CLIENT_ID;
  const clientSecret = process.env.KINDE_M2M_CLIENT_SECRET;
  const organizationCode = process.env.KINDE_ORG_CODE;

  if (!issuerUrl || !clientId || !clientSecret || !organizationCode) {
    throw new Error(
      "Kinde invitations are not configured. Add the Kinde M2M settings and organization code to the server environment.",
    );
  }

  const issuer = new URL(issuerUrl).origin;
  const tokenResponse = await fetch(`${issuer}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `${issuer}/api`,
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    throw new Error(
      `Kinde could not authorize the invitation service (${tokenResponse.status}). Check the M2M credentials and Management API scope.`,
    );
  }

  const token = (await tokenResponse.json()) as KindeTokenResponse;
  if (!token.access_token) {
    throw new Error("Kinde did not return an access token for invitations.");
  }

  const inviteResponse = await fetch(
    `${issuer}/api/v1/organization/${encodeURIComponent(organizationCode)}/invites`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        roles: [process.env.KINDE_DEFAULT_INVITE_ROLE ?? "member"],
        send_email: true,
      }),
      cache: "no-store",
    },
  );

  if (!inviteResponse.ok) {
    throw new Error(
      `Kinde could not create the invitation (${inviteResponse.status}). Check that invitations are enabled, the organization code is correct, and the M2M app has the invitation scope.`,
    );
  }
}
