const Button = ({ text, onclick, type = "button", className = "" }) => {
    return (
        <button
            type={type}
            onclick={onclick}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${className}`}
        >
            {text}
        </button>
    );
};
export default Button;