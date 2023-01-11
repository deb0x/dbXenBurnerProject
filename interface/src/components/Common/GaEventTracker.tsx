import ReactGA from "react-ga";

export default function useAnalyticsEventTracker(category: string) {
    const eventTracker = (action: string) => {
      ReactGA.event({category, action});
    }
    return eventTracker;
}