from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base
from app.database import engine

from app.routers.auth import router as auth_router

from app.routers import categorias
from app.routers import marcas
from app.routers import produtos
from app.routers import estoque
from app.routers import vendas
from app.routers import clientes
from app.routers import dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Auto e Lazer ERP"
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://claude.ai",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(categorias.router)
app.include_router(marcas.router)
app.include_router(produtos.router)
app.include_router(estoque.router)
app.include_router(vendas.router)
app.include_router(clientes.router)
app.include_router(dashboard.router)

@app.get("/")
def home():
    return {
        "status": "online"
    }