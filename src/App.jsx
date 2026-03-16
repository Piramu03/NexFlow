import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import WorkflowList from './pages/WorkflowList'
import WorkflowEditor from './pages/WorkflowEditor'
import RuleEditor from './pages/RuleEditor'
import ExecutionView from './pages/ExecutionView'
import AuditLog from './pages/AuditLog'
import ExecuteWorkflow from './pages/ExecuteWorkflow'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" />} />
          <Route path="/workflows" element={<WorkflowList />} />
          <Route path="/workflows/new" element={<WorkflowEditor />} />
          <Route path="/workflows/:id/edit" element={<WorkflowEditor />} />
          <Route path="/workflows/:id/execute" element={<ExecuteWorkflow />} />
          <Route
            path="/workflows/:workflowId/steps/:stepId/rules"
            element={<RuleEditor />}
          />
          <Route
            path="/executions/:executionId"
            element={<ExecutionView />}
          />
          <Route path="/audit" element={<AuditLog />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App