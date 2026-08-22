import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import 'highlight.js/styles/github.css'
import './index.css'
import App from './App.jsx'
import PDStudio from './pd-studio/PDStudio.jsx'
import Workbench from './workbench/Workbench.jsx'
import Apply from './cohort-matching/Apply.jsx'
import MatchingQueue from './cohort-matching/MatchingQueue.jsx'
import CoreStudioConsole from './core-studio/CoreStudioConsole.jsx'
import HuddleCalendar from './huddle-calendar/HuddleCalendar.jsx'
import ContributionMonitor from './contribution-monitor/ContributionMonitor.jsx'
import HumanCapitalReports from './human-capital-reports/HumanCapitalReports.jsx'
import IDStudio from './instructional-design/IDStudio.jsx'
import ModuleLibrary from './instructional-design/ModuleLibrary.jsx'
import PreviewLesson from './instructional-design/PreviewLesson.jsx'
import AssistMeWorkspace from './assist-me/AssistMeWorkspace.jsx'
import AssistPreview from './assist-me/AssistPreview.jsx'
import Cohorts from './cohorts/Cohorts.jsx'
import CDReview from './cd-review/CDReview.jsx'
import PmgtConsole from './pmgt/PmgtConsole.jsx'
import RequireRole from './auth/RequireRole.jsx'
import JsExperienceHome from './JsExperienceHome.jsx'

const ANY_CORE_ROLE = ['PD', 'PMGT', 'ID', 'CD']

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <StrictMode>
      <Routes>
        {/* IPF ops / recruit — never fall through to App's JS cinematic landing. */}
        <Route path="/pd-studio" element={<RequireRole roles={['PD']}><PDStudio /></RequireRole>} />
        <Route path="/workbench" element={<RequireRole roles={[]}><Workbench /></RequireRole>} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/matching-queue" element={<RequireRole roles={ANY_CORE_ROLE}><MatchingQueue /></RequireRole>} />
        <Route path="/core-studio" element={<RequireRole roles={ANY_CORE_ROLE}><CoreStudioConsole /></RequireRole>} />
        <Route path="/huddle-calendar" element={<RequireRole roles={ANY_CORE_ROLE}><HuddleCalendar /></RequireRole>} />
        <Route path="/contribution-monitor" element={<RequireRole roles={ANY_CORE_ROLE}><ContributionMonitor /></RequireRole>} />
        <Route path="/human-capital-reports" element={<RequireRole roles={ANY_CORE_ROLE}><HumanCapitalReports /></RequireRole>} />
        <Route path="/id-studio" element={<RequireRole roles={['ID']}><IDStudio /></RequireRole>} />
        <Route path="/module-library" element={<RequireRole roles={ANY_CORE_ROLE}><ModuleLibrary /></RequireRole>} />
        <Route path="/preview-lesson" element={<RequireRole roles={ANY_CORE_ROLE}><PreviewLesson /></RequireRole>} />
        <Route path="/assist-me" element={<RequireRole roles={[]}><AssistMeWorkspace /></RequireRole>} />
        <Route path="/assist-preview" element={<AssistPreview />} />
        <Route path="/join" element={<JsExperienceHome />} />
        <Route path="/try" element={<JsExperienceHome />} />
        <Route path="/cohorts" element={<RequireRole roles={ANY_CORE_ROLE}><Cohorts /></RequireRole>} />
        <Route path="/pmgt" element={<RequireRole roles={['PMGT', 'PD']}><PmgtConsole /></RequireRole>} />
        <Route path="/cd-review" element={<RequireRole roles={['CD']}><CDReview /></RequireRole>} />
        {/* JS learner App (cinematic → Apply / self-paced lessons). No catch-all — ops routes above must never fall through here. */}
        <Route path="/" element={<App />} />
        <Route path="/lessons/*" element={<App />} />
        <Route path="/register" element={<App />} />
      </Routes>
    </StrictMode>
  </HashRouter>,
)
