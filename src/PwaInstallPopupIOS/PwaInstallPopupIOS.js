import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import classnames from 'classnames';

import translations from './locales.json';
import shareIcon from './ic_iphone_share.png';

import './styles.scss';

const LOCAL_STORAGE_KEY = 'pwa_popup_display';
const NB_DAYS_EXPIRE = 10;
const DEFAULT_DELAY_FOR_DISPLAY_SECONDS = 10;
const DEFAULT_LANG = 'en';
const isDevelopment = process.env.NODE_ENV === 'development';

const isIos = () => {
	const userAgent = window.navigator.userAgent.toLowerCase();
	return /iphone|ipad|ipod/.test( userAgent );
};
const isIPad = () => {
	const userAgent = window.navigator.userAgent.toLowerCase();
	return /ipad/.test( userAgent );
};
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

const checkLastPwaDisplay = () => {
	const lastDisplayTimestamp = window.localStorage.getItem(LOCAL_STORAGE_KEY);
	if (!lastDisplayTimestamp) return true;
	const lastDisplayMoment = moment(parseInt(lastDisplayTimestamp));
	return moment().diff(lastDisplayMoment, 'days') > NB_DAYS_EXPIRE;
};
const saveLastPwaDisplay = () => {
	window.localStorage.setItem(LOCAL_STORAGE_KEY, moment().valueOf());
};

const addClickListener = (clickListener) => {
  window.addEventListener('click', clickListener);
  window.addEventListener('touchstart', clickListener);
  window.addEventListener('touch', clickListener);
}
const removeClickListener = (clickListener) => {
  window.removeEventListener('click', clickListener);
  window.removeEventListener('touchstart', clickListener);
  window.removeEventListener('touch', clickListener);
}

const PwaInstallPopupIOS = ({ lang, appIcon, styles, delay, children, force }) => {
  const [isOpen, setOpened] = useState(false);
  const languageCode = Object.keys(translations).includes(lang) ? lang : DEFAULT_LANG;

	const clickListener = () => {
		setOpened(v => {
			if(v) {
				saveLastPwaDisplay();
        removeClickListener(clickListener);
				return false;
			}
			return v;
		});
	};

	useEffect(() => {
    addClickListener(clickListener)
		const t = setTimeout(() => {
			if (isDevelopment) {
				console.log('isIOS: ', isIos());
				console.log('isInStandaloneMode: ', isInStandaloneMode());
				console.log('checkLastPwaDisplay: ', checkLastPwaDisplay());
			}
			if (force || (isIos() && !isInStandaloneMode() && checkLastPwaDisplay())) {
				setOpened(true);
			}
		}, delay * 1000);
		return () => {
      removeClickListener(clickListener);
			if (t) clearTimeout(t);
		};
	}, []);
	return isOpen ? (
		<div style={styles} className={classnames('pwa-install-popup-ios', {'ipad-device': isIPad()})}>
			{children ? children : (
        <div className="pwa-install-popup-ios-content">
          <div className="left">
            <img className="appIcon" src={appIcon} />
          </div>
          <div className="right">
            {translations[languageCode].PWA_POPUP_PART1}
            <span><img className="small" src={shareIcon} /></span>
            <br/>
            {translations[languageCode].PWA_POPUP_PART2}
          </div>
        </div>
      )}
		</div>
	) : null;
};

PwaInstallPopupIOS.propTypes = {
  lang: PropTypes.oneOf(['en', 'fr']),
	children: PropTypes.node,
	styles: PropTypes.object,
  force: PropTypes.bool,
  appIcon: PropTypes.string,
  delay: PropTypes.number,
};

PwaInstallPopupIOS.defaultProps = {
	styles: null,
  force: false,
  children: null,
  appIcon: null,
  delay: DEFAULT_DELAY_FOR_DISPLAY_SECONDS,
};

export default PwaInstallPopupIOS;
