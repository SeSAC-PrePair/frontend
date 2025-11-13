import { motion as Motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import '../styles/pages/Landing.css'

export default function LandingPage() {
  return (
    <div className="landing landing--compact">
      <Motion.section
        className="landing__intro"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className="tag">Interview Orbit</span>
        <h1>AI가 하루 한 번, 당신을 인터뷰 궤도에 올립니다.</h1>
        <p>
          Interview Orbit은 짧은 질문과 정돈된 피드백으로 면접 준비를 가장 간단하게 만드는 AI 코칭 스튜디오입니다. 오늘
          할 일은 로그인 후 확인해 주세요.
        </p>
        <div className="landing__cta">
          <Link to="/auth" className="cta-button cta-button--primary">
            로그인하기
          </Link>
        </div>
      </Motion.section>

      <Motion.section
        className="landing__note"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      >
        <p>자세한 이용 방법과 리워드 정보는 가입 후 단계별로 안내해 드립니다.</p>
      </Motion.section>
    </div>
  )
}
