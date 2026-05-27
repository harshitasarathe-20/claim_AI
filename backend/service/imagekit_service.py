import os
from pathlib import Path
from dotenv import load_dotenv
from imagekitio import ImageKit

load_dotenv()

IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY")
IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY")
IMAGEKIT_URL_ENDPOINT = os.getenv("IMAGEKIT_URL_ENDPOINT")

if ImageKit is None or not (IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT):
    print("[WARNING] ImageKit SDK or env vars not configured — upload will return mock responses")
    imagekit = None
else:
    imagekit = ImageKit(
        # public_key=IMAGEKIT_PUBLIC_KEY,
        private_key=IMAGEKIT_PRIVATE_KEY
        # base_url=IMAGEKIT_URL_ENDPOINT
    )


def _extract_resp(resp):
    """Normalize ImageKit response to a dict with file_id and url when available."""
    try:
        file_id = getattr(resp, "file_id", None) or (resp.get("file_id") if isinstance(resp, dict) else None)
        url = getattr(resp, "url", None) or (resp.get("url") if isinstance(resp, dict) else None)
        return {"file_id": file_id, "url": url, "raw": resp}
    except Exception:
        return {"file_id": None, "url": None, "raw": resp}


def upload_images(image_paths: list[str], folder: str = "/claim-ai-uploads") -> list[dict]:
    """Upload multiple image files to ImageKit.

    - `image_paths`: list of local file paths saved by `file_service.save_files`.
    - returns: list of dicts: {file, file_id, url, raw, error?}
    """
    results = []
    if imagekit is None:
        for p in image_paths:
            results.append({"file": p, "file_id": None, "url": None, "raw": None})
        return results

    for p in image_paths:
        try:
            ppath = Path(p)
            with open(ppath, "rb") as f:
                resp = imagekit.files.upload(
                    file=f,
                    file_name=ppath.name,
                    folder=folder,
                )
            info = _extract_resp(resp)
            info["file"] = p
            results.append(info)
        except Exception as e:
            results.append({"file": p, "file_id": None, "url": None, "error": str(e), "raw": None})

    return results


if __name__ == "__main__":
    sample = ["uploads/profile-pic (2).png"]
    print(upload_images(sample))
