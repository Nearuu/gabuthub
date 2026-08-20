import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

import Home from "../pages/Home";
import Explore from "../pages/Explore";
import Community from "../pages/Community";
import TierList from "../pages/TierList";
import Voting from "../pages/Voting";
import Game from "../pages/Game";
import Watchlist from "../pages/Watchlist";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Detail from "../pages/Detail";
import Admin from "../pages/Admin";
import AdminRoute from "../components/AdminRoute";
import NotFound from "../pages/NotFound";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "explore",
                element: <Explore />,
            },
            {
                path: "community",
                element: <Community />,
            },
            {
                path: "tierlist",
                element: <TierList />,
            },
            {
                path: "tier-list",
                element: <TierList />,
            },
            {
                path: "voting",
                element: <Voting />,
            },
            {
                path: "game",
                element: <Game />,
            },
            {
                path: "watchlist",
                element: <Watchlist />,
            },
            {
                path: "profile",
                element: <Profile />,
            },
            {
                path: "detail/:id",
                element: <Detail />,
            },
            {
                path: "admin",
                element: (
                    <AdminRoute>
                        <Admin />
                    </AdminRoute>
                ),
            },
            {
                path: "*",
                element: <NotFound />,
            },
        ]
    },
    {
        path: "/",
        element: <AuthLayout />,
        children: [
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            },
        ]
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);

export default router;