# 봄맞이 회식 장소 설문조사 앱

삼성전자 DSR 사업장 주변 회식 장소를 메뉴 카테고리 기반으로 추천해주는 웹앱입니다.

## 기능
- 메뉴 카테고리 선택형 설문 UX
- 카카오 지도에 식당 마커 표시
- 카카오 로컬 API를 활용한 DSR 반경 내 식당 추천

## 실행 방법
1. 의존성 설치
   ```bash
   npm install
   ```
2. 환경변수 설정
   ```bash
   cp .env.example .env
   ```
   `.env`에 카카오 JavaScript 키와 REST API 키를 입력하세요.
3. 실행
   ```bash
   npm start
   ```
4. 브라우저에서 `http://localhost:3000` 접속

## API
- `GET /api/config`: 프론트 초기 설정 반환
- `GET /api/places?menu=<category>`: 메뉴 카테고리 기반 식당 목록 조회

## 메뉴 카테고리 코드
- `korean`, `chinese`, `japanese`, `western`, `chicken`, `bbq`, `pub`, `cafe`
