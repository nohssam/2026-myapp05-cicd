# ===========================================
# 멀티스테이지 빌드 (Multi-stage Build)
# - 빌드 환경과 실행 환경을 분리하여 최종 이미지 크기를 줄임
# - 1단계: Node.js로 React 앱 빌드
# - 2단계: Nginx로 정적 파일만 서빙
# ===========================================

# ===========================================
# 1단계: 빌드 스테이지 (Build Stage)
# ===========================================
FROM node:20 AS build
# - node:20 공식 이미지 사용
# - AS build: 이 스테이지를 'build'라는 이름으로 지정 (2단계에서 참조)

WORKDIR /app
# - 컨테이너 내 작업 디렉토리를 /app으로 설정
# - 이후 모든 명령어는 이 디렉토리에서 실행됨

COPY package*.json ./
# - package.json과 package-lock.json만 먼저 복사
# - Docker 레이어 캐싱 활용: 의존성이 변경되지 않으면 npm install 캐시 재사용

RUN npm install
# - 의존성 패키지 설치
# - package-lock.json이 있으면 정확한 버전으로 설치됨

COPY . .
# - 나머지 모든 소스 코드 복사
# - .dockerignore 파일이 있으면 제외할 파일 지정 가능

RUN chmod +x node_modules/.bin/react-scripts
# - react-scripts 실행 권한 부여
# - Windows에서 빌드 시 권한 문제 방지

RUN npm run build
# - React 프로덕션 빌드 실행
# - 결과물은 /app/build 폴더에 생성됨 (최적화된 정적 파일)

# ===========================================
# 2단계: 실행 스테이지 (Production Stage)
# ===========================================
FROM nginx:alpine
# - nginx:alpine 경량 이미지 사용 (약 23MB)
# - 1단계의 node:20 이미지(약 1GB)는 최종 이미지에 포함되지 않음

COPY --from=build /app/build /usr/share/nginx/html
# - 1단계(build)에서 생성된 /app/build 폴더를
# - Nginx의 기본 웹 루트 디렉토리로 복사
# - 빌드된 정적 파일만 복사하므로 이미지 크기가 매우 작음

EXPOSE 80
# - 컨테이너가 80번 포트를 사용함을 문서화
# - 실제 포트 매핑은 docker run -p 옵션으로 설정

CMD ["nginx", "-g", "daemon off;"]
# - Nginx를 포그라운드 모드로 실행
# - daemon off: 컨테이너가 종료되지 않고 계속 실행되도록 함
