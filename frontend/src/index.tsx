import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router'
import OverlayRoot from "./overlay/OverlayRoot.tsx";
import ControlsRoot from "./controls/ControlsRoot.tsx";

import './index.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<OverlayRoot/>}/>
                <Route path="/controls" element={<ControlsRoot/>}/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)
