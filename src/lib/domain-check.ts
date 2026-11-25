export const SHED_DOMAIN = "hastingsmenshed.org.uk";
export const LOVABLE_TARGET_IP = "185.158.133.1";
export const KUALO_ORIGIN_IP = "91.197.230.195";

export type CheckLevel = "ok" | "pending" | "warning";

export interface DomainDnsSnapshot {
  domain: string;
  checkedAt: string;
  rootA: string[];
  rootAAAA: string[];
  wwwA: string[];
  wwwCname: string[];
  mailA: string[];
  mailCname: string[];
  lovableTxt: string[];
  mx: string[];
  ns: string[];
}

export interface EvaluatedDomainStatus {
  websiteLiveOnLovable: boolean;
  wwwResolvesToLovable: boolean;
  mailSafe: boolean;
  mailIsStillCnameToRoot: boolean;
  lovableVerifiedTxtFound: boolean;
  mxIntact: boolean;
  hasIpv6Conflict: boolean;
  kualoNsActive: boolean;
  checks: {
    emailMx: { level: CheckLevel; title: string; detail: string };
    mailSubdomain: { level: CheckLevel; title: string; detail: string };
    lovableTxt: { level: CheckLevel; title: string; detail: string };
    websiteA: { level: CheckLevel; title: string; detail: string };
    ipv6AndNs: { level: CheckLevel; title: string; detail: string };
  };
}

function cleanTxt(val: string): string {
  return val.replace(/^"|"$/g, "").trim();
}

export function evaluateDomainDns(snap: DomainDnsSnapshot): EvaluatedDomainStatus {
  const websiteLiveOnLovable = snap.rootA.includes(LOVABLE_TARGET_IP) && snap.rootA.length === 1;
  const wwwResolvesToLovable =
    snap.wwwA.includes(LOVABLE_TARGET_IP) ||
    (websiteLiveOnLovable && snap.wwwCname.some((c) => c.replace(/\.$/, "").toLowerCase() === snap.domain.toLowerCase()));

  const mailIsStillCnameToRoot = snap.mailCname.some(
    (c) => c.replace(/\.$/, "").toLowerCase() === snap.domain.toLowerCase(),
  );
  const mailSafe = !mailIsStillCnameToRoot && snap.mailA.length > 0 && !snap.mailA.includes(LOVABLE_TARGET_IP);

  const cleanedTxt = snap.lovableTxt.map(cleanTxt);
  const lovableVerifiedTxtFound = cleanedTxt.some((t) => t.toLowerCase().startsWith("lovable_verify="));

  const mxIntact = snap.mx.length > 0;
  const hasIpv6Conflict = snap.rootAAAA.length > 0;
  const kualoNsActive = snap.ns.some((n) => n.toLowerCase().includes("kualo.net"));

  const emailMx = mxIntact
    ? {
        level: "ok" as CheckLevel,
        title: "Email receiving (MX records) is safe",
        detail: `Found ${snap.mx.length} MX record(s): ${snap.mx.join(", ")}. Leave these untouched.`,
      }
    : {
        level: "warning" as CheckLevel,
        title: "No MX email records detected",
        detail: "Check Kualo Zone Editor to make sure your mail1/2/3.filteredmx.net MX records are still present.",
      };

  const mailSubdomain = mailSafe
    ? {
        level: "ok" as CheckLevel,
        title: `Email server (mail.${snap.domain}) is safely pinned`,
        detail: `Points directly to ${snap.mailA.join(", ")} (independent of the website). Outlook & phone mail apps stay connected.`,
      }
    : mailIsStillCnameToRoot
      ? {
          level: "warning" as CheckLevel,
          title: `Action before switching: mail.${snap.domain} still follows the website`,
          detail: `Currently a CNAME to ${snap.domain}. Change it to an A record pointing to ${KUALO_ORIGIN_IP} in Kualo before changing the website IP so Outlook & phones keep working.`,
        }
      : {
          level: "pending" as CheckLevel,
          title: `Check mail.${snap.domain}`,
          detail:
            snap.mailA.length > 0
              ? `Currently resolves to ${snap.mailA.join(", ")}. Make sure it points to Kualo (${KUALO_ORIGIN_IP}), not Lovable (${LOVABLE_TARGET_IP}).`
              : `No A record found for mail.${snap.domain}. Add an A record pointing to ${KUALO_ORIGIN_IP} if members use mail.${snap.domain} in email apps.`,
        };

  const lovableTxt = lovableVerifiedTxtFound
    ? {
        level: "ok" as CheckLevel,
        title: "Lovable ownership TXT record detected",
        detail: `Found _lovable.${snap.domain} -> ${cleanedTxt.find((t) => t.toLowerCase().startsWith("lovable_verify="))}`,
      }
    : {
        level: "pending" as CheckLevel,
        title: "Lovable verification TXT record not added yet",
        detail: `Add a TXT record for _lovable.${snap.domain} with the lovable_verify=... value from Lovable Settings → Domains.`,
      };

  const websiteA = websiteLiveOnLovable
    ? {
        level: "ok" as CheckLevel,
        title: `Website is LIVE on the new site (${LOVABLE_TARGET_IP})`,
        detail: wwwResolvesToLovable
          ? `Both ${snap.domain} and www.${snap.domain} point to Lovable.`
          : `${snap.domain} points to Lovable. Check that www.${snap.domain} is a CNAME to ${snap.domain} or A record to ${LOVABLE_TARGET_IP}.`,
      }
    : {
        level: "pending" as CheckLevel,
        title: `Still pointing to old website (${snap.rootA.join(", ") || "none"})`,
        detail: `When ready to switch over, update the root A record for ${snap.domain} from ${KUALO_ORIGIN_IP} to ${LOVABLE_TARGET_IP}.`,
      };

  const ipv6AndNs = hasIpv6Conflict
    ? {
        level: "warning" as CheckLevel,
        title: "Remove IPv6 (AAAA) record before verifying",
        detail: `Found AAAA record(s): ${snap.rootAAAA.join(", ")}. Delete root AAAA records in Kualo so Lovable SSL verifies cleanly.`,
      }
    : {
        level: "ok" as CheckLevel,
        title: kualoNsActive
          ? "Nameservers on Kualo & no IPv6 conflicts"
          : "No IPv6 (AAAA) conflicts detected",
        detail: kualoNsActive
          ? `Managed by ${snap.ns.slice(0, 2).join(", ")} (no changes needed at 123-Reg).`
          : `Active nameservers: ${snap.ns.join(", ") || "detected"}.`,
      };

  return {
    websiteLiveOnLovable,
    wwwResolvesToLovable,
    mailSafe,
    mailIsStillCnameToRoot,
    lovableVerifiedTxtFound,
    mxIntact,
    hasIpv6Conflict,
    kualoNsActive,
    checks: { emailMx, mailSubdomain, lovableTxt, websiteA, ipv6AndNs },
  };
}

export function buildKualoSupportTicket(verifyValue: string): string {
  const cleanVerify = verifyValue.trim() || "[PASTE YOUR lovable_verify=... VALUE FROM LOVABLE HERE]";
  return `Subject: DNS record update for hastingsmenshed.org.uk (keep email on Kualo)

Hello Kualo Support,

We are launching a new website for Hastings & St Leonards Men's Shed (Registered Charity No. 1175075) hosted externally, while keeping our domain DNS and all charity email (info@hastingsmenshed.org.uk and sales@hastingsmenshed.org.uk) hosted here on Kualo.

Please could you update the DNS zone for hastingsmenshed.org.uk with these exact changes, while leaving our MX records, SPF/TXT email records, and nameservers completely untouched?

1. IMPORTANT — Keep email working first:
   Replace the existing CNAME record for "mail.hastingsmenshed.org.uk" with a direct A record pointing to our Kualo server IP:
   - Type: A
   - Name: mail.hastingsmenshed.org.uk.
   - Value: ${KUALO_ORIGIN_IP}

2. Add domain verification TXT record:
   - Type: TXT
   - Name: _lovable.hastingsmenshed.org.uk.
   - Value: ${cleanVerify}

3. Point the website to the new host:
   Update the root A record for "hastingsmenshed.org.uk." from ${KUALO_ORIGIN_IP} to:
   - Type: A
   - Name: hastingsmenshed.org.uk.
   - Value: ${LOVABLE_TARGET_IP}
   (Please leave "www.hastingsmenshed.org.uk." as a CNAME to "hastingsmenshed.org.uk." and ensure there are no root AAAA records.)

Please confirm once these 3 DNS records are updated. Many thanks for your help!`;
}
