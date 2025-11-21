const Spinner = ({borderColor}) => {
  return (
    <div className={`${borderColor} border w-fit mx-auto  rounded-full px-2 border-t-0 border-r-0 animate-spin`}>
      <p className="opacity-0">S</p>
    </div>
  )
}

export default Spinner;
