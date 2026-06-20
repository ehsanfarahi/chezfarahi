
export default function Image({src, alt, width, imgStyle}) {
    return <img src={src} alt={alt} width={width} className={imgStyle} style={{maxWidth: "100%"}} />
}