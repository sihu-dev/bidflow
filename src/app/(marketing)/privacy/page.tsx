/**
 * 개인정보처리방침 페이지
 */
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: '개인정보처리방침 | BIDFLOW',
  description: 'BIDFLOW 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6">법적 고지</Badge>
          <h1 className="text-4xl font-bold mb-8">개인정보처리방침</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground mb-8">
              최종 수정일: 2025년 1월 1일
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. 개인정보의 처리 목적</h2>
            <p className="text-muted-foreground mb-4">
              BIDFLOW는 다음의 목적을 위하여 개인정보를 처리합니다:<br/>
              - 회원 가입 및 관리<br/>
              - 서비스 제공 및 운영<br/>
              - 고객 문의 응대<br/>
              - 서비스 개선 및 신규 서비스 개발
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. 수집하는 개인정보 항목</h2>
            <p className="text-muted-foreground mb-4">
              <strong>필수 항목:</strong> 이메일, 비밀번호, 이름<br/>
              <strong>선택 항목:</strong> 회사명, 전화번호<br/>
              <strong>자동 수집:</strong> IP 주소, 쿠키, 서비스 이용 기록
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-muted-foreground mb-4">
              회원 탈퇴 시까지 보유하며, 탈퇴 후 지체 없이 파기합니다.
              단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. 개인정보의 제3자 제공</h2>
            <p className="text-muted-foreground mb-4">
              BIDFLOW는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
              다만, 법령에 의거하거나 수사 목적으로 법령에 정해진 절차에 따라 요청이 있는 경우는 예외로 합니다.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. 개인정보의 안전성 확보 조치</h2>
            <p className="text-muted-foreground mb-4">
              - 개인정보 암호화<br/>
              - 해킹 등에 대비한 보안시스템 구축<br/>
              - 개인정보 접근 제한<br/>
              - 개인정보 취급 직원의 교육
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. 정보주체의 권리·의무</h2>
            <p className="text-muted-foreground mb-4">
              이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며,
              가입 해지(동의 철회)를 요청할 수 있습니다.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. 개인정보 보호책임자</h2>
            <p className="text-muted-foreground mb-4">
              성명: 개인정보보호팀<br/>
              이메일: privacy@bidflow.io
            </p>

            <div className="mt-12 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                개인정보 관련 문의는 <a href="mailto:privacy@bidflow.io" className="text-primary hover:underline">privacy@bidflow.io</a>로 연락해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
