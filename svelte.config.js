import adapter from '@sveltejs/adapter-static'; // @sveltejs/adapter-static을 로드하고 적용
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// https://svelte.dev/docs/kit/adapter-static
		// adapter-static을 사용하여 빌드 결과물을 정적 파일로 생성
		adapter: adapter({
			// SPA 모드로 배포할 때, fallback: 'index.html'이 필요하다면 지정
			// 하지만 SSG 페이지가 있는 경우엔 별도 fallback이 필요하지 않음
			// SPA 라우팅을 위한 fallback이 필요하면 uncomment:
			fallback: 'index.html', // 동적 라우트 요청을 index.html(SPA)로 포워딩
			pages: 'build',       // 정적 HTML/CSS/JS 파일 출력 디렉토리
			assets: 'build',      // 정적 자원(이미지, 폰트 등) 출력 디렉토리
			precompress: false,
			// SSG로만 배포하면 true로 해서 엄격하게 검사하는게 맞는데,
			// SPA로도 배포하는거라 매핑 안되는 페이지(fallback으로 구현된 SPA 페이지들)가 있어서 무조건 실패함
			// 그래서 false로 설정해줘야 함.
			strict: false
		})
	}
};

export default config;
