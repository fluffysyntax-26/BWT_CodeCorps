from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from utils.clerk_auth import get_current_user
from services.receipt_service import extract_text_from_image, parse_receipt_with_ai, parse_receipt_image

router = APIRouter()


from services.receipt_service import parse_receipt_image

@router.post("/scan")
async def scan_receipt(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):

    image_bytes = await file.read()

    result = await parse_receipt_image(image_bytes)

    return {
        "parsed_expense": result
    }