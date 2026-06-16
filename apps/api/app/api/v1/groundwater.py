from fastapi import APIRouter
from pydantic import BaseModel

from app.rag.retriever import GroundwaterRetriever

router = APIRouter()
retriever = GroundwaterRetriever()


class GroundwaterQueryRequest(BaseModel):
    query: str
    district: str | None = None
    language: str = "en"


@router.get("/summary")
def summary() -> dict[str, object]:
    return {
        "average_level_m": 18.4,
        "recharge_index": 72,
        "alert_count": 9,
        "critical_blocks": 14,
        "monitored_wells": 284,
        "districts": [
            {
                "name": "Bengaluru Rural",
                "state": "Karnataka",
                "level_m": 21.2,
                "trend": "falling",
                "stress": "high",
                "recharge_index": 58,
                "rainfall_mm": 612,
                "extraction_mcm": 284,
                "latitude": 13.28,
                "longitude": 77.54,
                "monthly_levels": [
                    {"month": "Jan", "level_m": 17.8, "recharge_index": 68},
                    {"month": "Feb", "level_m": 18.5, "recharge_index": 64},
                    {"month": "Mar", "level_m": 19.2, "recharge_index": 61},
                    {"month": "Apr", "level_m": 20.4, "recharge_index": 59},
                    {"month": "May", "level_m": 21.2, "recharge_index": 58},
                ],
                "recommendation": "Prioritize recharge shafts near public tanks and restrict new high-capacity borewells until post-monsoon recovery is confirmed.",
                "recharge_recommendations": [
                    "Install recharge shafts around public tanks and storm-water drains.",
                    "Restore feeder channels before the southwest monsoon window.",
                    "Route rooftop runoff from public buildings into filtered recharge pits.",
                ],
                "conservation_recommendations": [
                    "Pause new high-capacity irrigation borewells in stressed blocks.",
                    "Shift peri-urban layouts to metered, dual-source supply.",
                    "Promote drip conversion for borewell-fed horticulture clusters.",
                ],
                "ai_insights": [
                    "Falling levels with moderate rainfall indicate extraction pressure is outpacing recharge.",
                    "Recharge structures should be placed near tank cascades where runoff concentration is highest.",
                ],
            },
            {
                "name": "Mandya",
                "state": "Karnataka",
                "level_m": 13.8,
                "trend": "stable",
                "stress": "moderate",
                "recharge_index": 74,
                "rainfall_mm": 721,
                "extraction_mcm": 196,
                "latitude": 12.52,
                "longitude": 76.9,
                "monthly_levels": [
                    {"month": "Jan", "level_m": 13.2, "recharge_index": 76},
                    {"month": "Feb", "level_m": 13.4, "recharge_index": 75},
                    {"month": "Mar", "level_m": 13.7, "recharge_index": 74},
                    {"month": "Apr", "level_m": 13.9, "recharge_index": 73},
                    {"month": "May", "level_m": 13.8, "recharge_index": 74},
                ],
                "recommendation": "Maintain canal conjunctive-use monitoring and promote micro-irrigation for sugarcane clusters.",
                "recharge_recommendations": [
                    "Use canal rotation periods to recharge shallow aquifers through managed percolation ponds.",
                    "Desilt village tanks connected to command-area drainage.",
                    "Create recharge trenches along field bunds in tail-end villages.",
                ],
                "conservation_recommendations": [
                    "Expand micro-irrigation for sugarcane and paddy transition plots.",
                    "Track conjunctive use so canal releases reduce borewell pumping.",
                    "Prioritize water budgeting for high-duty crop clusters.",
                ],
                "ai_insights": [
                    "Stable water levels suggest current recharge is holding, but extraction remains sensitive to crop choice.",
                    "Command-area monitoring can prevent localized stress from being hidden by district averages.",
                ],
            },
            {
                "name": "Kolar",
                "state": "Karnataka",
                "level_m": 28.1,
                "trend": "falling",
                "stress": "critical",
                "recharge_index": 42,
                "rainfall_mm": 438,
                "extraction_mcm": 318,
                "latitude": 13.13,
                "longitude": 78.13,
                "monthly_levels": [
                    {"month": "Jan", "level_m": 23.6, "recharge_index": 51},
                    {"month": "Feb", "level_m": 24.9, "recharge_index": 48},
                    {"month": "Mar", "level_m": 26.0, "recharge_index": 45},
                    {"month": "Apr", "level_m": 27.3, "recharge_index": 43},
                    {"month": "May", "level_m": 28.1, "recharge_index": 42},
                ],
                "recommendation": "Declare priority watch blocks, accelerate treated-water recharge pilots, and audit irrigation borewell abstraction.",
                "recharge_recommendations": [
                    "Scale treated-water recharge pilots with monthly quality checks.",
                    "Build check dams and recharge wells in hard-rock fracture zones.",
                    "Map abandoned borewells for safe conversion into recharge structures.",
                ],
                "conservation_recommendations": [
                    "Audit irrigation borewell abstraction in critical gram panchayats.",
                    "Move high-water crops to protected cultivation or lower-duty alternatives.",
                    "Introduce block-level extraction caps until post-monsoon recovery improves.",
                ],
                "ai_insights": [
                    "Critical stress, low rainfall, and high extraction point to structural aquifer depletion.",
                    "Recharge alone will be insufficient unless abstraction controls are paired with demand reduction.",
                ],
            },
            {
                "name": "Mysuru",
                "state": "Karnataka",
                "level_m": 11.6,
                "trend": "rising",
                "stress": "low",
                "recharge_index": 86,
                "rainfall_mm": 824,
                "extraction_mcm": 148,
                "latitude": 12.29,
                "longitude": 76.64,
                "monthly_levels": [
                    {"month": "Jan", "level_m": 13.1, "recharge_index": 78},
                    {"month": "Feb", "level_m": 12.8, "recharge_index": 80},
                    {"month": "Mar", "level_m": 12.3, "recharge_index": 83},
                    {"month": "Apr", "level_m": 11.9, "recharge_index": 85},
                    {"month": "May", "level_m": 11.6, "recharge_index": 86},
                ],
                "recommendation": "Continue watershed maintenance and preserve recharge zones from urban encroachment.",
                "recharge_recommendations": [
                    "Protect upstream watershed treatment structures from siltation.",
                    "Maintain percolation tanks in forest-edge and foothill catchments.",
                    "Use urban lakes as monitored recharge buffers after inlet filtration.",
                ],
                "conservation_recommendations": [
                    "Preserve mapped recharge zones in new urban development approvals.",
                    "Keep municipal leakage reduction tied to ward-level groundwater trends.",
                    "Encourage reuse for parks and institutions to avoid shallow aquifer drawdown.",
                ],
                "ai_insights": [
                    "Rising levels and strong recharge index show current watershed practices are working.",
                    "The main risk is land-use change reducing infiltration faster than monitoring detects.",
                ],
            },
        ],
    }


@router.post("/query")
def query(payload: GroundwaterQueryRequest) -> dict[str, object]:
    retrieved = retriever.retrieve(f"{payload.district or ''} {payload.query}".strip())
    return {
        "query": payload.query,
        "district": payload.district,
        "language": payload.language,
        "answer": "Retrieved groundwater context is available for this query. Use /chat for full Gemini-powered reasoning.",
        "citations": [
            {"title": item.title, "source": item.source, "excerpt": item.excerpt}
            for item in retrieved
        ],
    }
