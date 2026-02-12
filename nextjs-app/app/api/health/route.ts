/**
 * Health Check Endpoint
 * Verifica se o sistema está funcionando corretamente
 * Usado por monitors e load balancers
 */

import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const checks: Record<string, { status: string; responseTime?: number; error?: string }> = {};
  const startTime = Date.now();

  // Check 1: Database connection
  try {
    const dbStart = Date.now();
    const sb = getSupabase();
    const { error } = await sb.from("workspaces").select("id").limit(1);
    
    if (error) {
      checks.database = { status: "error", error: error.message };
    } else {
      checks.database = { 
        status: "healthy", 
        responseTime: Date.now() - dbStart 
      };
    }
  } catch (err) {
    checks.database = { 
      status: "error", 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }

  // Check 2: Memory usage
  const memUsage = process.memoryUsage();
  const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  checks.memory = { 
    status: memMB > 512 ? "warning" : "healthy",
    responseTime: memMB
  };

  // Overall status
  const hasErrors = Object.values(checks).some(c => c.status === "error");
  const hasWarnings = Object.values(checks).some(c => c.status === "warning");
  
  const overallStatus = hasErrors ? "unhealthy" : hasWarnings ? "degraded" : "healthy";
  const statusCode = hasErrors ? 503 : hasWarnings ? 200 : 200;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks,
    },
    { status: statusCode }
  );
}

// HEAD endpoint para health checks leves
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
