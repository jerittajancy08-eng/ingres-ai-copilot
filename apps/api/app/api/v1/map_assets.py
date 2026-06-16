from fastapi import APIRouter

router = APIRouter()


@router.get("/assets")
def assets() -> list[dict[str, object]]:
    return [
        {"id": "well-1", "name": "Kolar Observation Well", "latitude": 13.13, "longitude": 78.13, "status": "critical"},
        {"id": "well-2", "name": "Mandya Recharge Site", "latitude": 12.52, "longitude": 76.9, "status": "normal"},
        {"id": "well-3", "name": "Mysuru Piezometer", "latitude": 12.29, "longitude": 76.64, "status": "watch"},
    ]
