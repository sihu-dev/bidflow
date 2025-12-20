#!/usr/bin/env node
/**
 * BIDFLOW DB 마이그레이션 스크립트
 * PostgreSQL 직접 연결
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Direct 연결 (포트 5432)
const DATABASE_URL = 'postgresql://postgres:Abc0315!@db.srmyrrenbhwdfdgnnlnn.supabase.co:5432/postgres';

async function runMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Supabase DB 연결 중...');
    await client.connect();
    console.log('✅ 연결 성공!\n');

    const sqlPath = path.join(__dirname, '../bidflow/supabase/migrations/001_create_tables_and_indexes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('🚀 마이그레이션 실행 중...\n');

    // 전체 SQL 실행
    await client.query(sql);

    console.log('✨ 마이그레이션 완료!\n');

    // 테이블 확인
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 생성된 테이블:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ 오류:', error.message);

    // 상세 오류 표시
    if (error.position) {
      console.error(`   위치: ${error.position}`);
    }
    if (error.detail) {
      console.error(`   상세: ${error.detail}`);
    }
  } finally {
    await client.end();
    console.log('\n🔌 연결 종료');
  }
}

runMigration();
