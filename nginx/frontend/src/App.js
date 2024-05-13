// import VcpLogin from 'vcp-test/dist/components/VcoLogin';
// import { VcpMonthlyPivot } from 'vcp-cal-components';
import { Button } from 'vcp-github-components';
import './App.css';
// import {VcpLogin, Button} from "vcp-test"

function App() {
  return (
    <div className="App">
      <h2>hello world</h2>
      {/* <VcpLogin loginUrl={"https://contacts.virtusasystems.com/api/login/student"} subscriberCode='swtb'/> */}
      {/* <Button>Hello</Button>
      <VcpMonthlyPivot subscriberCode='ta'/> */}
      <Button/>
    </div>
  );
}

export default App;


// aws codeartifact delete-package --domain virtusasystems --domain-owner 787952688011 --repository vcp-react-components --format npm --package vcp-cal-components