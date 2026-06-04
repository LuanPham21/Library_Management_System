import { App as AntdApp } from 'antd';
import { RouterProvider } from 'react-router-dom';

import './App.css';
import { router } from './routes';

function App() {
  return (
    <AntdApp>
      <RouterProvider router={router} />
    </AntdApp>
  )
}

export default App
