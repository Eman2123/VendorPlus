"""
alerts.py

Sends a real email alert via Gmail SMTP when a vendor crosses into a higher
risk tier (>=3) or becomes unreachable_final. Reads credentials from .env
(ALERT_EMAIL_FROM, ALERT_EMAIL_APP_PASSWORD) — never hardcode credentials here.
"""

import os
import smtplib
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()


ALERT_TIER_THRESHOLD = 3  # tiers >= this trigger an alert


def _send_email(subject: str, body: str) -> bool:
    """
    Sends a real email via Gmail SMTP using credentials from .env.
    Returns True if sent successfully, False otherwise (logs the failure
    but never raises — an alert failure should not crash the calling request).
    """
    sender = os.getenv("ALERT_EMAIL_FROM")
    app_password = os.getenv("ALERT_EMAIL_APP_PASSWORD")

    if not sender or not app_password:
        print("[alerts] ALERT_EMAIL_FROM / ALERT_EMAIL_APP_PASSWORD not set — skipping email")
        return False

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = sender  # hackathon demo: alerts sent to self

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender, app_password)
            server.sendmail(sender, [sender], msg.as_string())
        return True
    except Exception as e:
        print(f"[alerts] Failed to send email: {e}")
        return False


def check_and_send_alert(
    vendor_name: str,
    order_id: str,
    risk_tier: int,
    unreachable_final: bool,
    delivery_status: str,
) -> bool:
    """
    Checks whether this call result warrants an alert (tier crossing or
    unreachable), and sends an email if so. Returns True if an alert was sent.
    """
    should_alert = risk_tier >= ALERT_TIER_THRESHOLD or unreachable_final

    if not should_alert:
        return False

    if unreachable_final:
        subject = f"[VendorPulse Alert] Vendor unreachable — Order {order_id}"
        body = (
            f"Vendor: {vendor_name}\n"
            f"Order: {order_id}\n"
            f"Status: Unreachable after 3 call attempts.\n"
            f"Action needed: manual follow-up required."
        )
    else:
        subject = f"[VendorPulse Alert] High risk (Tier {risk_tier}) — Order {order_id}"
        body = (
            f"Vendor: {vendor_name}\n"
            f"Order: {order_id}\n"
            f"Risk Tier: {risk_tier}\n"
            f"Delivery Status: {delivery_status}\n"
            f"Action needed: review and follow up."
        )

    return _send_email(subject, body)