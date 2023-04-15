import React from 'react';
import {ColorRing} from 'react-loader-spinner';

interface SplashScreenProps {
    text: string;
}
export const SplashScreen = (props: SplashScreenProps) => {
    return (
        <div className="splash-screen">
            <h2>{`Exporting ${props.text}... `}</h2>
            <div className="cs5 ce12">
                <ColorRing
                    visible={true}
                    height="70"
                    width="70"
                    ariaLabel="blocks-loading"
                    wrapperStyle={{}}
                    wrapperClass="blocks-wrapper"
                    colors={['#232F3E', '#003181', '#2074d5', '#fbd8bf', '#ff9900']}
                />
            </div>
        </div>
    );
};