import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router'
import OverlayRoot from "./overlay/OverlayRoot.tsx";
import ControlsRoot from "./controls/ControlsRoot.tsx";

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
