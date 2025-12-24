#!/usr/bin/env node
/**
 * BIDFLOW DB 마이그레이션 - Supabase Management API
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
  console.log('🚀 BIDFLOW 마이그레이션 시작...\n');

  const sqlPath = path.join(__dirname, '../bidflow/supabase/migrations/001_create_tables_and_indexes.sql');
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

      // 테이블 확인
      const checkResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
          }),
        }
      );

      const tables = await checkResponse.json();
      console.log('📋 생성된 테이블:');
      if (Array.isArray(tables)) {
        tables.forEach(row => {
          console.log(`   ✓ ${row.table_name}`);
        });
      } else {
        console.log(JSON.stringify(tables, null, 2));
      }
    } else {
      console.log('❌ 마이그레이션 실패:', response.status);
      console.log(result);
    }
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

runMigration();
