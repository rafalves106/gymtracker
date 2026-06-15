type JwtClaims = {
  username: string;
  email: string;
  isMaster: boolean;
};

// Mapeia as claims longas do .NET para nomes simples
const CLAIM_KEYS = {
  name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  master: "isMaster",
};

export function decodeToken(token: string | null): JwtClaims | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      username: payload[CLAIM_KEYS.name] ?? "—",
      email: payload[CLAIM_KEYS.email] ?? "—",
      isMaster:
        payload[CLAIM_KEYS.master] === "True" ||
        payload[CLAIM_KEYS.master] === true,
    };
  } catch {
    return null;
  }
}
