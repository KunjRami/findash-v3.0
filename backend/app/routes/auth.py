from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta

from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import (
    hash_password,
    authenticate_user,
    create_access_token,
    get_user_by_email,
    get_user_by_id,
    decode_token,
)
from app.database import get_database
from app.config import settings
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await get_user_by_id(payload.get("sub", ""))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(user_data: UserCreate):
    db = get_database()

    if await get_user_by_email(user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    if await db.users.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    now = datetime.utcnow()
    result = await db.users.insert_one(
        {
            "username": user_data.username,
            "email": user_data.email,
            "password": hash_password(user_data.password),
            "full_name": user_data.full_name,
            "created_at": now,
        }
    )
    user_id = str(result.inserted_id)
    token = create_access_token(
        {"sub": user_id},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            created_at=now,
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_access_token(
        {"sub": user_id},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            username=user["username"],
            email=user["email"],
            full_name=user.get("full_name"),
            created_at=user["created_at"],
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"],
        full_name=current_user.get("full_name"),
        created_at=current_user["created_at"],
    )