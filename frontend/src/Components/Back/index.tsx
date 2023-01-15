import { useNavigate } from 'react-router-dom'

interface BackProps {
    to: string
}
export const Back = (props: BackProps) => {
    const navigate = useNavigate()
    return (
        <div className="grid top">
            <div
                className="cs1 ce1 icon icon-back-1"
                onClick={() => navigate(props.to)}
            ></div>
        </div>
    )
}
