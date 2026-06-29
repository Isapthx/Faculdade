from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario

from app.schemas.usuario_schema import (
    UsuarioCreate,
    UsuarioLogin
)

from app.security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)

@router.post("/register")
def register(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):

    existe = db.query(Usuario).filter(
        Usuario.email == usuario.email
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail="Email já cadastrado"
        )

    novo_usuario = Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha=hash_password(usuario.senha)
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return {
        "mensagem": "Usuário criado com sucesso"
    }

@router.post("/login")
def login(
    usuario: UsuarioLogin,
    db: Session = Depends(get_db)
):

    user = db.query(Usuario).filter(
        Usuario.email == usuario.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Credenciais inválidas"
        )

    if not verify_password(
        usuario.senha,
        user.senha
    ):
        raise HTTPException(
            status_code=401,
            detail="Credenciais inválidas"
        )

    token = create_access_token(
        {"sub": user.email}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }