import React, { useEffect, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import Axios from "axios";
Axios.defaults.baseURL = process.env.BACKENDURL || "";

// Contexts

import StateContext from "./StateContext.js";
import DispatchContext from "./DispatchContext.js";

// Components
import Header from "./components/Header.js";
import HomeGuest from "./components/HomeGuest.js";
import Footer from "./components/Footer.js";
import About from "./components/About.js";
import Terms from "./components/Terms.js";
import Home from "./components/Home.js";
const CreatePost = React.lazy(() => import("./components/CreatePost.js"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost.js"));
import FlashMessages from "./components/FlashMessages.js";
import Profile from "./components/Profile.js";
import EditPost from "./components/EditPost.js";
import NotFound from "./components/NotFound.js";
const Search = React.lazy(() => import("./components/Search.js"));
const Chat = React.lazy(() => import("./components/Chat.js"));
import LoadingDotsIcon from "./components/LoadingDotsIcon.js";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("appToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("appToken"),
      username: localStorage.getItem("appUsername"),
      avatar: localStorage.getItem("appAvatar")
    },
    isSearcOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "logout":
        draft.loggedIn = false;
        return;
      case "flashMessage":
        draft.flashMessages.push(action.value);
        return;
      case "openSearch":
        draft.isSearcOpen = true;
        return;
      case "closeSearch":
        draft.isSearchOpen = false;
        return;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "closeChat":
        draft.isChatOpen = false;
        return;
      case "incrementUnreadChatCount":
        draft.unreadChatCount++;
        return;
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token });
          if (!response.data) {
            dispatch({ type: "logout" });
            dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again." });
          }
        } catch (e) {
          console.log(e.response.data);
        }
      }

      fetchResults();

      return () => ourRequest.cancel();
    }
  }, []);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("appToken", state.user.token);
      localStorage.setItem("appUsername", state.user.username);
      localStorage.setItem("appAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("appToken");
      localStorage.removeItem("appUsername");
      localStorage.removeItem("appAvatar");
    }
  }, [state.loggedIn]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />

          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
              <Route path="/about-us" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/post/:id" element={<ViewSinglePost />} />
              <Route path="/post/:id/edit" element={<EditPost />} />
              <Route path="/profile/:username/*" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          <CSSTransition timeout={330} in={state.isSearcOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

const root = createRoot(document.querySelector("#app"));
root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
