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
			// SSG랑 SPA도 같이 배포할 때, 동적 라우트 요청을 spa.html(SPA)로 포워딩하는 fallback을 지정
			// index.html의 경우 기본 메인 페이지랑 곂치므로 다른 이름 사용
			fallback: 'spa.html',
			pages: 'build',       // 정적 HTML/CSS/JS 파일 출력 디렉토리
			assets: 'build',      // 정적 자원(이미지, 폰트 등) 출력 디렉토리
			precompress: false,
			strict: true
		})
	}
};

export default config;
