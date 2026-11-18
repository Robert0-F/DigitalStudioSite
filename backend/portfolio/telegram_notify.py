import os

import requests


def notify_telegram_lead(*, name: str, contact: str, description: str = "", project_type: str = "") -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or ""
    chat_id = os.environ.get("TELEGRAM_CHAT_ID") or ""
    if not token or not chat_id:
        return

    lines = [
        "🆕 Новая заявка с сайта",
        f"Имя: {name}",
        f"Контакт: {contact}",
    ]
    if project_type:
        lines.append(f"Тип: {project_type}")
    if description:
        lines.append(f"Задача: {description}")

    try:
        requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": "\n".join(lines)},
            timeout=8,
        )
    except Exception:
        pass
