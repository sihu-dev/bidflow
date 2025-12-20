/**
 * 이용약관 페이지
 */
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: '이용약관 | BIDFLOW',
  description: 'BIDFLOW 서비스 이용약관',
};

export default function TermsPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6">법적 고지</Badge>
          <h1 className="text-4xl font-bold mb-8">이용약관</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground mb-8">
              최종 수정일: 2025년 1월 1일
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">제1조 (목적)</h2>
            <p className="text-muted-foreground mb-4">
              이 약관은 BIDFLOW(이하 &quot;회사&quot;)가 제공하는 입찰 자동화 서비스(이하 &quot;서비스&quot;)의
              이용조건 및 절차, 회사와 이용자의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">제2조 (용어의 정의)</h2>
            <p className="text-muted-foreground mb-4">
              1. &quot;서비스&quot;란 회사가 제공하는 입찰 공고 수집, 분석, 제안서 생성 등의 기능을 말합니다.<br/>
              2. &quot;이용자&quot;란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.<br/>
              3. &quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 서비스를 이용할 수 있는 자를 말합니다.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <p className="text-muted-foreground mb-4">
              1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.<br/>
              2. 회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있습니다.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">제4조 (서비스 이용)</h2>
            <p className="text-muted-foreground mb-4">
              1. 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.<br/>
              2. 회사는 시스템 점검, 증설 및 교체 등의 사유로 서비스를 일시 중단할 수 있습니다.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">제5조 (회원의 의무)</h2>
            <p className="text-muted-foreground mb-4">
              1. 회원은 서비스 이용 시 관계 법령, 이 약관의 규정, 이용안내 등을 준수하여야 합니다.<br/>
              2. 회원은 서비스를 이용하여 얻은 정보를 회사의 사전 동의 없이 복제, 배포할 수 없습니다.
            </p>

            <div className="mt-12 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                문의사항이 있으시면 <a href="/contact" className="text-primary hover:underline">문의하기</a> 페이지를 통해 연락해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
