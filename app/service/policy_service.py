import fitz  # PyMuPDF

def extract_text(policy_path: str) -> str:
    doc = fitz.open(policy_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text