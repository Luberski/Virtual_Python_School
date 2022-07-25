from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.schemas.playground import PlaygroundRequest, PlaygroundResponse
from app.python_runner import RemotePythonRunner

router = APIRouter()


@router.post("/playground", tags=["playground"], response_model=PlaygroundResponse)
def playground(
    request_data: PlaygroundRequest,
):
    rpr = RemotePythonRunner()
    text, err = rpr.run_code(request_data.data.content)
    if len(err) == 0:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {"content": text},
                "error": None,
            },
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"error": err},
    )
