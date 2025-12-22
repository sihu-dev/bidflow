#!/usr/bin/env node
/**
 * BIDFLOW Vector Search 마이그레이션 - Supabase Management API
 * pgvector 확장 및 시맨틱 검색 함수 설정
 */

const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_19c81537257044f10cc4de81d0b1cf014f53a222';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'srmyrrenbhwdfdgnnlnn';

async function runMigration() {
  console.log('🚀 BIDFLOW Vector Search 마이그레이션 시작...\n');

  const sqlPath = path.join(__dirname, '../supabase/migrations/20251222000001_add_vector_search.sql');

  if (!fs.existsSync(sqlPath)) {
    console.error('❌ SQL 파일을 찾을 수 없습니다:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8');

  console.log(`📋 SQL 파일 로드 완료 (${sql.length} bytes)\n`);
  console.log('📝 마이그레이션 내용:');
  console.log('   - pgvector 확장 활성화');
  console.log('   - bids.embedding 컬럼 추가 (1536 dim)');
  console.log('   - products.embedding 컬럼 추가 (1536 dim)');
  console.log('   - match_bids() 함수 생성');
  console.log('   - match_products() 함수 생성');
  console.log('   - semantic_match_bid_to_products() 함수 생성');
  console.log('   - embedding_stats 뷰 생성\n');

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
      console.log('✅ Vector Search 마이그레이션 성공!\n');

      // 임베딩 컬럼 확인
      const checkResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              SELECT table_name, column_name, data_type
              FROM information_schema.columns
              WHERE column_name = 'embedding'
              ORDER BY table_name
            `
          }),
        }
      );

      const columns = await checkResponse.json();
      console.log('📋 추가된 임베딩 컬럼:');
      if (Array.isArray(columns)) {
        columns.forEach(row => {
          console.log(`   ✓ ${row.table_name}.${row.column_name} (${row.data_type})`);
        });
      } else {
        console.log(JSON.stringify(columns, null, 2));
      }

      // 함수 확인
      const funcResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              SELECT routine_name
              FROM information_schema.routines
              WHERE routine_schema = 'public'
                AND routine_name IN ('match_bids', 'match_products', 'semantic_match_bid_to_products')
              ORDER BY routine_name
            `
          }),
        }
      );

      const funcs = await funcResponse.json();
      console.log('\n📋 생성된 함수:');
      if (Array.isArray(funcs)) {
        funcs.forEach(row => {
          console.log(`   ✓ ${row.routine_name}()`);
        });
      } else {
        console.log(JSON.stringify(funcs, null, 2));
      }

      console.log('\n🎉 마이그레이션 완료!');
      console.log('다음 단계: 제품 및 입찰 데이터 임베딩 생성');
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
