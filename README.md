# Secure Market

중고거래 플랫폼 과제를 위한 Next.js 기반 웹 애플리케이션입니다.

## 주요 기능

- 회원가입, 로그인, 로그아웃
- 상품 등록, 상품 목록, 검색, 분류 필터
- 상품 상세 보기와 판매자 문의
- 악성 상품/사용자 신고
- 관리자 상품 상태 변경, 사용자 차단, 신고 처리
- SQLite와 Prisma 기반 로컬 데이터베이스

## 기술 스택

- Next.js
- TypeScript
- SQLite
- Prisma
- Tailwind CSS

## 실행 방법

```bash
npm install
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

브라우저에서 `http://127.0.0.1:3000`으로 접속합니다.

## 테스트 계정

| 역할 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 관리자 | admin@example.com | Admin01!Aa |
| 판매자 | seller@example.com | User01!Aa |

## 보안 구현

- 비밀번호는 `bcryptjs`로 해시 저장
- 세션 토큰은 HttpOnly 쿠키와 서버 DB 해시로 관리
- 관리자 페이지는 관리자 권한만 접근
- 차단 사용자는 로그인, 상품 등록, 문의 제한
- 서버 액션에서 입력 길이, 가격 범위, URL 형식, enum 값을 검증
- Prisma 쿼리로 SQL Injection 위험 완화
