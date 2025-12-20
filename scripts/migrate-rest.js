#!/usr/bin/env node
/**
 * BIDFLOW DB 마이그레이션 스크립트
 * Supabase REST API 사용
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://srmyrrenbhwdfdgnnlnn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXlycmVuYmh3ZGZkZ25ubG5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2Njc4NywiZXhwIjoyMDgxNzQyNzg3fQ._4XXwSYDm8JCFAwN6XyuUJyV6Ri2Og9pLCuBEbFM8tc';

async function testConnection() {
  console.log('🔌 Supabase 연결 테스트...\n');

  try {
    // REST API 테스트
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });

    if (response.ok) {
      console.log('✅ REST API 연결 성공!');
      return true;
    } else {
      console.log('❌ REST API 연결 실패:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 연결 오류:', error.message);
    return false;
  }
}

async function main() {
  const connected = await testConnection();

  if (connected) {
    console.log('\n📋 DB 마이그레이션 방법:\n');
    console.log('1. SQL Editor 열기:');
    console.log('   👉 https://supabase.com/dashboard/project/srmyrrenbhwdfdgnnlnn/sql/new\n');
    console.log('2. 아래 SQL 파일 내용 복사 & 붙여넣기:');
    console.log('   📁 bidflow/supabase/migrations/001_create_tables_and_indexes.sql\n');
    console.log('3. Run 버튼 클릭\n');
  }
}

main();
