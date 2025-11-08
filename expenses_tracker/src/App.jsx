import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import AddExpense from "./pages/personal/AddExpense";
import ViewExpense from "./pages/personal/ViewExpense";
import CreateGroup from "./pages/group/CreateGroup";
import MyGroups from "./pages/group/MyGroups";
import GroupDetail from "./pages/group/GroupDetail";
import PersonalBudget from "./pages/budget/PersonalBudget";
import GroupBudget from "./pages/budget/GroupBudget";
import GroupBudgetList from "./pages/budget/GroupBudgetList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/addexpense" element={<AddExpense />} />
        <Route path="/viewexpense" element={<ViewExpense />} />
        <Route path="/creategroup" element={<CreateGroup />} />
        <Route path="/mygroups" element={<MyGroups />} />
        <Route path="/group/:id" element={<GroupDetail />} />
        <Route path="/budget/personal" element={<PersonalBudget />} />
        <Route path="/budget/group" element={<GroupBudgetList />} />
        <Route path="/budget/group/:groupId" element={<GroupBudget />} />
      </Routes>
    </Router>
  );
}

export default App;
