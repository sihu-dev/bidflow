#!/usr/bin/env node
/**
 * BIDFLOW Sludge AI Module - DB Migration
 * Sludge AI 모듈 DB 마이그레이션
 */

const fs = require('fs');
const path = require('path');

// SECURITY: 환경 변수에서 로드 (하드코딩 금지)
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'srmyrrenbhwdfdgnnlnn';

if (!ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN 환경 변수가 필요합니다');
  console.error('   export SUPABASE_ACCESS_TOKEN=your_token');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Sludge AI 모듈 마이그레이션 시작...\n');

  const sqlPath = path.join(__dirname, '../supabase/migrations/010_create_sludge_tables.sql');

  if (!fs.existsSync(sqlPath)) {
    console.error('❌ SQL 파일을 찾을 수 없습니다:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8');

  console.log(`📋 SQL 파일 로드 완료 (${sql.length} bytes)\n`);

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    const result = await response.text();

    if (response.ok) {
      console.log('✅ 마이그레이션 성공!\n');

      // Sludge 테이블 확인
      const checkResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'sludge_%' ORDER BY table_name`
          }),
        }
      );

      const tables = await checkResponse.json();
      console.log('📋 생성된 Sludge 테이블:');
      if (Array.isArray(tables)) {
        tables.forEach(row => {
          console.log(`   ✓ ${row.table_name}`);
        });
      } else {
        console.log(JSON.stringify(tables, null, 2));
      }

      console.log('\n🎉 Sludge AI 모듈 DB 준비 완료!');
    } else {
      console.log('❌ 마이그레이션 실패:', response.status);
      console.log(result);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

runMigration();
