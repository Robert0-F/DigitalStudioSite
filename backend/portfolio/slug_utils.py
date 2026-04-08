import re


_CYR_TO_LAT = {
    "а": "a",
    "б": "b",
    "в": "v",
    "г": "g",
    "д": "d",
    "е": "e",
    "ё": "yo",
    "ж": "zh",
    "з": "z",
    "и": "i",
    "й": "y",
    "к": "k",
    "л": "l",
    "м": "m",
    "н": "n",
    "о": "o",
    "п": "p",
    "р": "r",
    "с": "s",
    "т": "t",
    "у": "u",
    "ф": "f",
    "х": "h",
    "ц": "ts",
    "ч": "ch",
    "ш": "sh",
    "щ": "sch",
    "ъ": "",
    "ы": "y",
    "ь": "",
    "э": "e",
    "ю": "yu",  # может быть переопределена эвристикой ниже
    "я": "ya",  # может быть переопределена эвристикой ниже
}

_VOWELS = set(["а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я"])


def transliterate_cyrillic_to_latin(text: str) -> str:
    """
    Простой детерминированный транслит RU -> Latin.

    Важная эвристика:
    - для последовательностей "юю" и "яа/ая" используем сокращённую форму,
      чтобы "Сююмбике" -> "syuumbike" (как в требовании).
    """

    s = str(text or "").strip().lower()
    if not s:
        return ""

    out = []
    prev = ""

    for ch in s:
        if ch == "ю":
            # если предыдущий символ — гласная (включая 'ю'), используем 'u'
            out.append("u" if prev in _VOWELS else "yu")
        elif ch == "я":
            out.append("a" if prev in _VOWELS else "ya")
        else:
            out.append(_CYR_TO_LAT.get(ch, ch))
        prev = ch

    return "".join(out)


def latin_slug_from_text(text: str) -> str:
    """
    Генерация slug только на латинице [a-z0-9-].
    """

    t = transliterate_cyrillic_to_latin(text)
    t = re.sub(r"[^a-z0-9]+", "-", t)
    t = re.sub(r"-{2,}", "-", t).strip("-")
    return t

