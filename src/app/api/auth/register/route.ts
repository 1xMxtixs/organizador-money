import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const encryptionSalt = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        encryptionSalt,
        name,
      },
    });

    return NextResponse.json(
      { message: "Cuenta creada exitosamente", userId: user.id },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
