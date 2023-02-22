import { useNavigate } from 'react-router-dom'

interface BackProps {
    to: string
}
export const Back = (props: BackProps) => {
    const navigate = useNavigate()
    return (
        <div className="grid top mgb-1 " onClick={() => navigate(props.to)}>
            <div className="cs1 ce1 icon icon-back-1 mouse-pointer"></div>
            <div className="cs2 ce12 mouse-pointer">Back</div>
        </div>
    )
}
