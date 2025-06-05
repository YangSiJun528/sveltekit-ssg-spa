# SvelteKit 기반 SPA + SSG 사이트 만들기

Saas 만들때 권한 없이 모두 볼 수 있는 페이지는 SSG로 해서 SEO 잘 되게 하고,
나머지 인증 이후 보여지는 부분은 어차피 크롤링 못하니까 SPA로 만드려는 목적

잘 동작하는지 확인하는 법

### 1. 빌드해서 파일 생성

```
npm run build
```

빌드 디렉토리에 정적 페이지들과 나머지 SPA(index.html)이 잘 생성되었는지 확인

### 2. preview 실행하기

```
npm run preview
```

### ~~2. 빌드 디렉토리를 기준으로 정적 서버를 실행해서 동작 확인~~

```
cd build
python -m http.server 8000
```

서버 없이도 동작 잘 됨.

근데 fallback 설정이 안되어있어서, SPA 처리가 잘 안됨.  
이 방식으론 안되는 듯?

### 3. Netlify로 배포하기

사이트가서 배포하면 됨. 루트에 설정 파일 만들어둠.

지금은 https://comfy-pegasus-cb3734.netlify.app/ 를 사용

### 4. SSG 동작 안하는 문제 해결하기

> fallback 옵션을 index.html로 설정하면, 빌드 시 생성된 정적 HTML 파일이 아닌 index.html을 모든 경로에 대해 반환하게 됩니다. 이로 인해 SSG로 생성된 페이지도 SPA처럼 동작하게 됩니다.

라는데, 그래서 수정해줘야 할 듯?

### 5. 여차저차 해서 잘 도는거 확인

안된다고 착각했던게, hydration 때문이였던거 같음

- 일반 클릭 (SPA 모드):
  - 설명
    - 브라우저에서 JavaScript가 활성화된 상태
    - SvelteKit의 클라이언트 사이드 라우팅이 동작
    - 페이지 전환 시 부드러운 전환 효과와 빠른 로딩
  - 이미 사이트가 열려있고 JS 활성화 되어있는 상태에서 다른 사이트로 이동 시 발생

- Cmd+클릭 또는 새 탭 (SSG 모드):
  - 설명
    - 서버에서 미리 생성된 정적 HTML 파일을 직접 로드
    - JavaScript 없이도 완전한 콘텐츠가 표시됨
    - 이것이 바로 SSG가 제대로 작동하는 증거입니다
  - https://comfy-pegasus-cb3734.netlify.app/about 으로 바로 이동하거나 새 탭으로 열 때 SSG처럼 정적 필드된 파일이 그대로 반환됨.
  - 개발자 도구에서 JS 끄고 일반적으로 이동해도 잘 됨.
    - 근데 SPA나 없는 사이트(이것도 SPA가 다 잡고 있어서)로 이동하면 SPA라서 빈 화면만 뜸.
    - SPA인 사이트: https://comfy-pegasus-cb3734.netlify.app/dashboard
  - (경로 없는 사이트를 SPA가 다 잡는게 맞나 싶긴 하네, 이따 수정할 듯?)

### 6. `[...catchall]` 제거

그냥 전역 에러 사이트 만들고, JS 없는 환경에서는 빈 404 반환하게 됨.   
일반적인 사용자는 JS가 있어야 하고, 크롤러는 404 응답 값 정도는 확인할 태니까 상관 없지 않을까?

이게 더 나아보이긴 함.

## 구현 핵심 설명

1. svelte.config.js에서 `@sveltejs/adapter-static`을 로드해서 `adapter` 갈아 끼우기
   - 나머지 설정은 현재 구현 보고 참고하기
2. SSG가 필요한 경우 `+page.svelte`나 `+layout.svelte`에
   - `export const prerender = true;`, `export const ssr = true;`
   - `ssr = true`가 없으면 SSG가 안됨.
     - 서버가 없는데도 ssr을 활성화해야 하는 이유는 SSG가 서버에서 뿌려주는거라 `ssr = false`로 하면 모순된다고 생각하던가, 아님 뭐 버그던가...
       - 아님 정적 파일 서버나 동적 서버에서든 정적으로 보내주는 서버 단 전송이니까 ssr이라고 보던가?
     - 일단 없으면 안되니까 넣으면 됨
3. SPA가 필요한 경우 `+page.svelte`나 `+layout.svelte`에
   - `export const ssr = false;`, `export const prerender = false;`
   - 사용하기
   - 이건 CSR이려면 ssr이랑 prerender 옵션이 꺼져있어야 하는게 맞음.


# GPT 설명
## 요약

이 업데이트에서는 기존 SvelteKit 프로젝트에 `/dashboard` 경로를 추가하고, `/dashboard` 하위 경로에서 이동이 모두 클라이언트 사이드(SPA)로 동작하도록 구성합니다. `src/routes/dashboard/+layout.js` 파일에서 `ssr = false` 및 `prerender = false`를 명시하여 해당 섹션을 전적으로 CSR로 처리하며, `adapter-static`의 `fallback: 'index.html'` 옵션을 유지하여 `/dashboard/*` 경로 요청 시 모두 `index.html`로 리다이렉트되어 SPA 라우팅이 이루어집니다. 정적 생성 대상은 여전히 `/about`, `/main`, `/pricing`만 지정되며, 그 외 모든 경로—이제는 `/dashboard` 및 그 하위도 포함—에 대해 별도 HTML 파일을 만들지 않고 클라이언트 측 라우터로 진입하도록 설정합니다. 이로써 대시보드 영역 내의 세부 페이지 전환은 모두 브라우저 단에서 처리됩니다. ([github.com][1], [reddit.com][2], [svelte.dev][3])

---

## 1. 개요

* 기존 프로젝트에서 전역적으로 `ssr = false`, `prerender = false`를 `src/routes/+layout.js`에 선언하여 SSR과 프리렌더링을 비활성화했으며, `/about`, `/main`, `/pricing` 페이지만 개별적으로 `prerender = true`, `ssr = true`를 선언해 SSG로 처리했습니다. ([reddit.com][4], [github.com][5])
* `@sveltejs/adapter-static`의 `fallback: 'index.html'` 옵션을 사용해, 빌드 시 생성되지 않은 모든 경로 요청을 단일 HTML로 연결하여 SPA처럼 동작하도록 했습니다. ([svelte.dev][6], [stackoverflow.com][7])
* 이번 업데이트에서는 `/dashboard` 디렉토리를 `src/routes/dashboard` 아래에 추가하고, 해당 디렉토리 및 모든 하위 경로를 **오직 클라이언트 렌더링(CSR)** 으로만 동작하도록 구성합니다. ([reddit.com][2], [svelte.dev][3])
* `/dashboard` 하위의 구체적인 페이지(예: `/dashboard/settings`, `/dashboard/profile`)를 추가할 경우 서브디렉토리에 개별 `+page.svelte` 파일을 배치하며, 전역 설정 덕분에 별도 프리렌더 없이 전부 SPA로 로드됩니다. ([svelte.dev][8], [svelte.dev][9])

---

## 2. 파일 구조 및 변경사항

프로젝트의 주요 디렉토리 구조는 아래와 같습니다.

```
my-demo-app/  
├─ src/  
│  ├─ routes/  
│  │  ├─ +layout.js  
│  │  ├─ +layout.svelte  
│  │  ├─ about/  
│  │  │  └─ +page.svelte  
│  │  ├─ main/  
│  │  │  └─ +page.svelte  
│  │  ├─ pricing/  
│  │  │  └─ +page.svelte  
│  │  ├─ dashboard/                   ← 새로 추가  
│  │  │  ├─ +layout.js                ← 대시보드 전용 CSR 레이아웃  
│  │  │  ├─ +page.svelte              ← /dashboard 기본 진입점  
│  │  │  └─ settings/  
│  │  │     └─ +page.svelte           ← /dashboard/settings 예시  
│  │  └─ [...catchall]/  
│  │     └─ +page.svelte              ← SPA fallback  
├─ svelte.config.js  
└─ package.json  
```

* **`src/routes/+layout.js`**: 여전히 `export const ssr = false; export const prerender = false;`로 전역 SSR/프리렌더 비활성화. ([stackoverflow.com][10], [svelte.dev][3])
* **`src/routes/dashboard/+layout.js`**: 대시보드 영역 전체를 CSR로 처리하기 위해 `export const ssr = false; export const prerender = false;`를 선언. ([github.com][1], [svelte.dev][3])
* **`src/routes/dashboard/+page.svelte`**: `/dashboard` 루트 페이지를 정의한다. 사용자는 이 페이지에서 추가 UI나 네비게이션을 구현할 수 있다. CSR 전용이므로 모듈 스크립트에 아무런 `prerender` 설정이 없어도 된다. ([svelte.dev][8], [svelte.dev][3])
* **`src/routes/dashboard/settings/+page.svelte`**: `/dashboard/settings` 예시 페이지. 마찬가지로 CSR 전용이며, 일체의 `prerender`나 `ssr` 설정이 필요하지 않다. ([svelte.dev][8], [svelte.dev][3])
* **`src/routes/[...catchall]/+page.svelte`**: 기존과 동일하게, `/about`, `/main`, `/pricing` 외 모든 경로의 Fallback 페이지. `export const prerender = false;`를 내부 모듈 스크립트에 선언하여 클라이언트 라우터로 넘긴다. ([svelte.dev][6], [docs.netlify.com][11])

---

## 3. 코드 예시

### 3.1. `svelte.config.js`

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    // 정적 호스팅을 위한 static adapter 설정 (SPA fallback) :contentReference[oaicite:10]{index=10}
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html'  // SPA용 단일 진입점 설정 :contentReference[oaicite:11]{index=11}
    }),
    // 전역 prerender 설정을 따로 지정하지 않고, 각 페이지마다 제어함
  }
};

export default config;
```

### 3.2. 전역 레이아웃: `src/routes/+layout.js`

```js
// src/routes/+layout.js
// 전역적으로 SSR과 prerender를 모두 끕니다 (기본적으로 CSR 모드) :contentReference[oaicite:12]{index=12}
export const ssr = false;
export const prerender = false;
```

### 3.3. 전역 레이아웃 뷰: `src/routes/+layout.svelte`

```svelte
<!-- src/routes/+layout.svelte -->
<nav>
  <a href="/main">Main</a>
  <a href="/about">About</a>
  <a href="/pricing">Pricing</a>
  <a href="/dashboard">Dashboard</a>   <!-- 대시보드 메뉴 추가 -->
</nav>

<slot />
```

### 3.4. 정적 페이지 (변경 없음)

#### 3.4.1. `src/routes/about/+page.svelte`

```svelte
<script context="module">
  export const prerender = true;  // SSG 대상 페이지 :contentReference[oaicite:13]{index=13}
  export const ssr = true;        // 정적 빌드 시 SSR 허용 :contentReference[oaicite:14]{index=14}
</script>

<h1>About</h1>
<p>이 페이지는 빌드 시 정적으로 생성된 About 페이지입니다.</p>
```

#### 3.4.2. `src/routes/main/+page.svelte`

```svelte
<script context="module">
  export const prerender = true;  // SSG 대상 페이지 :contentReference[oaicite:15]{index=15}
  export const ssr = true;        // 정적 빌드 시 SSR 허용 :contentReference[oaicite:16]{index=16}
</script>

<h1>Main</h1>
<p>이 페이지는 빌드 시 정적으로 생성된 Main(프로젝트 소개) 페이지입니다.</p>
```

#### 3.4.3. `src/routes/pricing/+page.svelte`

```svelte
<script context="module">
  export const prerender = true;  // SSG 대상 페이지 :contentReference[oaicite:17]{index=17}
  export const ssr = true;        // 정적 빌드 시 SSR 허용 :contentReference[oaicite:18]{index=18}
</script>

<h1>Pricing</h1>
<p>이 페이지는 빌드 시 정적으로 생성된 Pricing(요금) 페이지입니다.</p>
```

### 3.5. 대시보드 영역

#### 3.5.1. `src/routes/dashboard/+layout.js`

```js
// src/routes/dashboard/+layout.js
// 대시보드 섹션 전체를 SSR/프리렌더 없이 클라이언트 사이드로만 렌더링하도록 합니다. :contentReference[oaicite:19]{index=19}
export const ssr = false;
export const prerender = false;
```

#### 3.5.2. `src/routes/dashboard/+page.svelte`

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<!-- 모듈 스크립트에서 prerender나 ssr을 지정하지 않으면 기본적으로 CSR로 동작합니다. :contentReference[oaicite:20]{index=20} -->
<h1>Dashboard</h1>
<p>이곳은 대시보드 진입점 페이지입니다. 클라이언트 라우터가 관리합니다.</p>

<nav>
  <a href="/dashboard/settings">Settings</a>
</nav>

<!-- 대시보드 하위 내용이 표시될 곳 -->
<slot />
```

#### 3.5.3. `src/routes/dashboard/settings/+page.svelte`

```svelte
<!-- src/routes/dashboard/settings/+page.svelte -->
<!-- 별도 prerender/ssr 선언 없이 CSR로만 동작합니다. :contentReference[oaicite:21]{index=21} -->
<h2>Settings</h2>
<p>이곳은 /dashboard/settings 페이지입니다. 클라이언트 사이드 네비게이션에 따라 표시됩니다.</p>
```

### 3.6. SPA Fallback: `src/routes/[...catchall]/+page.svelte`

```svelte
<script context="module">
  // 이 Catch-all 페이지는 프리렌더를 사용하지 않으며, 빌드 시 HTML을 생성하지 않습니다. :contentReference[oaicite:22]{index=22}
  export const prerender = false;
</script>

<h1>Fallback</h1>
<p>정적 빌드되지 않은 모든 경로에서 클라이언트 라우팅이 처리됩니다.</p>
```

---

## 4. 동작 원리 및 배포

1. **빌드 시 정적 페이지 생성**

    * `npm run build` 명령을 실행하면, SvelteKit은 `/about`, `/main`, `/pricing` 경로에 대해 정적 HTML을 생성합니다 (모듈 스크립트 내의 `prerender = true`, `ssr = true` 설정 덕분) ([github.com][5], [github.com][12]).
    * `/dashboard` 및 그 하위 경로는 `prerender = false`로 설정되어 있으므로 빌드 시 HTML 파일이 생성되지 않습니다 ([reddit.com][2], [svelte.dev][3]).
    * `adapter-static`의 `fallback: 'index.html'` 덕분에 생성되지 않은 모든 경로 요청은 `build/index.html`로 응답되며, 그 안에서 SvelteKit의 클라이언트 라우터가 해당 경로를 해석합니다 ([svelte.dev][6], [stackoverflow.com][7]).

2. **개발 서버 동작**

    * `npm run dev` 상태에서, 전역 SSR이 비활성화되어 있기 때문에 `/dashboard`로 접근하면 즉시 빈 HTML 셸이 로드되고, 그 후 클라이언트 JS가 번들 로딩 후 라우팅을 수행하여 `Dashboard` 컴포넌트가 보여집니다 ([github.com][1], [svelte.dev][3]).

3. **클라이언트 라우팅 처리**

    * 브라우저에서 `/dashboard`, `/dashboard/settings` 등으로 직접 주소창 입력 시에도 모두 `index.html`(또는 `fallback`)이 먼저 로드되고, 그 후 SvelteKit 라우터가 URL을 파싱해 해당 컴포넌트를 렌더링합니다 ([reddit.com][2], [docs.netlify.com][11]).
    * 내비게이션 `<a href="/dashboard/settings">` 같은 링크를 클릭할 때도 클라이언트 라우터가 페이지 전환을 수행해 전체 페이지 리로드 없이 스무스한 SPA 경험을 제공합니다 ([svelte.dev][8], [svelte.dev][3]).

4. **정적 호스팅 배포**

    * `build/` 디렉토리에 생성된 정적 자원을 AWS S3, Netlify, Vercel 등의 정적 호스팅 서비스에 업로드합니다 ([svelte.dev][6]).
    * S3 버킷의 정적 웹 사이트 호스팅 설정에서 **인덱스 문서**와 **오류 문서**를 모두 `index.html`로 지정하면 `/dashboard/*` 요청 시에도 SPA로 진입하게 됩니다 ([stackoverflow.com][7]).

---

## 5. 추가 참고

* **`ssr`와 `prerender` 옵션**

    * SvelteKit 공식 문서에서 `export const ssr = false;`를 사용하면 해당 레이아웃이나 페이지가 클라이언트 전용으로만 렌더링됨을 설명합니다 ([svelte.dev][3], [stackoverflow.com][10]).
    * `export const prerender = true;`를 페이지 레벨에서 지정하면, 빌드 시 자동으로 HTML이 생성되고 정적 파일로 출력됩니다 ([svelte.dev][9], [github.com][5]).

* **어댑터 설정**

    * `@sveltejs/adapter-static`을 사용하여 정적 사이트로 빌드할 때, `fallback: 'index.html'`을 설정하면 SPA 모드가 가능함을 소개합니다 ([svelte.dev][6], [stackoverflow.com][7]).

이제 `/dashboard` 및 모든 하위 경로는 별도 서버 없이 오직 클라이언트 사이드 라우터로 처리되며, `/about`, `/main`, `/pricing`만 정적 파일로 생성되어 SEO나 로봇 크롤링에 최적화됩니다.

[1]: https://github.com/sveltejs/kit/discussions/9719?utm_source=chatgpt.com "Prerender landing page in SPA mode · sveltejs kit · Discussion #9719"
[2]: https://www.reddit.com/r/sveltejs/comments/10yjwmi/partially_prerender_with_static_adaptor/?utm_source=chatgpt.com "Partially pre-render with static adaptor : r/sveltejs - Reddit"
[3]: https://svelte.dev/docs/kit/single-page-apps?utm_source=chatgpt.com "Single-page apps • Docs - Svelte"
[4]: https://www.reddit.com/r/sveltejs/comments/14dqnjb/sveltekit_is_awful_for_building_pwas/?utm_source=chatgpt.com "SvelteKit is awful for building PWAs : r/sveltejs - Reddit"
[5]: https://github.com/sveltejs/kit/issues/7899?utm_source=chatgpt.com "Unable to entirely disable prerendering · Issue #7899 · sveltejs/kit"
[6]: https://svelte.dev/docs/kit/page-options?utm_source=chatgpt.com "Page options • Docs - Svelte"
[7]: https://stackoverflow.com/questions/76885946/sveltekit-asks-me-to-set-config-kit-prerender-default-to-be-true-also-tells-me?utm_source=chatgpt.com "sveltekit asks me to set config.kit.prerender.default to be true, also ..."
[8]: https://svelte.dev/docs/kit/routing?utm_source=chatgpt.com "Routing • Docs - Svelte"
[9]: https://svelte.dev/tutorial/kit/prerender?utm_source=chatgpt.com "Page options / prerender • Svelte Tutorial"
[10]: https://stackoverflow.com/questions/72251017/sveltekit-disable-ssr?utm_source=chatgpt.com "SvelteKit: disable SSR - server side rendering - Stack Overflow"
[11]: https://docs.netlify.com/frameworks/sveltekit/?utm_source=chatgpt.com "SvelteKit on Netlify"
[12]: https://github.com/sveltejs/kit/discussions/3365?utm_source=chatgpt.com "SvelteKit without SSR / SSG? · sveltejs kit · Discussion #3365 - GitHub"
