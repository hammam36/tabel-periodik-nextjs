import { NextResponse } from "next/server";
import elementsData from "./data.json";

export async function GET() {
    return NextResponse.json(elementsData);
}