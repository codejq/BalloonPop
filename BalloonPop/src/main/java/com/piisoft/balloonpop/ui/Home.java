package com.piisoft.balloonpop.ui;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Looper;
import android.preference.PreferenceManager;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintJob;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.text.InputType;
import android.util.Log;
import android.util.TypedValue;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.app.AlertDialog;

import com.google.zxing.ResultPoint;
import com.journeyapps.barcodescanner.BarcodeCallback;
import com.journeyapps.barcodescanner.BarcodeResult;
import com.journeyapps.barcodescanner.CaptureManager;
import com.journeyapps.barcodescanner.DecoratedBarcodeView;
import com.piisoft.balloonpop.Installation;
import com.piisoft.balloonpop.R;


import android.content.Context;
import android.content.DialogInterface;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.PopupMenu;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.Toast;

import java.io.Console;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Random;

import android.content.SharedPreferences;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;
import com.google.zxing.client.android.BeepManager;

import android.widget.FrameLayout.LayoutParams;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;


public class Home extends Activity  {
    private View mContentView;
    private WebView myWebView;
    public static final int INPUT_FILE_REQUEST_CODE = 1;
    public static final String EXTRA_FROM_NOTIFICATION = "EXTRA_FROM_NOTIFICATION";
    private ValueCallback<Uri[]> mFilePathCallback;
    private String mCameraPhotoPath;
    private SharedPreferences preferences;
    private Context context;
    private String mainUrl = "file:///android_asset/www/index.html";
    private ProgressBar prg;
    private int errorcounts = 0;
    private View mCustomView;

    private FrameLayout customViewContainer;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private MyWebChromeClient mWebChromeClient;
    private CaptureManager capture;
    private DecoratedBarcodeView barcodeScannerView;
    private BeepManager beepManager;
    private String lastText;
    private long lastScan;
    // Storage Permissions variables
    private static final int REQUEST_EXTERNAL_STORAGE = 1;
    private static String[] PERMISSIONS_STORAGE = {
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
    };

    //persmission method.
    public static void verifyStoragePermissions(Activity activity) {
        // Check if we have read or write permission
        int writePermission = ActivityCompat.checkSelfPermission(activity, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        int readPermission = ActivityCompat.checkSelfPermission(activity, Manifest.permission.READ_EXTERNAL_STORAGE);

        if (writePermission != PackageManager.PERMISSION_GRANTED || readPermission != PackageManager.PERMISSION_GRANTED) {
            // We don't have permission so prompt the user
            ActivityCompat.requestPermissions(
                    activity,
                    PERMISSIONS_STORAGE,
                    REQUEST_EXTERNAL_STORAGE
            );
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        //setActivitySize(false);
        //capture.onResume();
        barcodeScannerView.resume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        //capture.onPause();
        barcodeScannerView.pause();
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        //setActivitySize(false);
    }
    @Override
    public void onUserInteraction () {
        super.onUserInteraction();
        //setActivitySize(false);
    }

    /*
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            //hideSystemUI();
        }
        setActivitySize(false);
    }
*/

    @Override
    public void onWindowFocusChanged(boolean hasFocus)
    {
        super.onWindowFocusChanged(hasFocus);
        int  currentApiVersion = android.os.Build.VERSION.SDK_INT;
        if(currentApiVersion >= Build.VERSION_CODES.KITKAT && hasFocus)
        {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
    }


    private void setFullScreen(){
        int  currentApiVersion = android.os.Build.VERSION.SDK_INT;

        final int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;

        // This work only for android 4.4+
        if(currentApiVersion >= Build.VERSION_CODES.KITKAT)
        {

            getWindow().getDecorView().setSystemUiVisibility(flags);

            // Code below is to handle presses of Volume up or Volume down.
            // Without this, after pressing volume buttons, the navigation bar will
            // show up and won't hide
            final View decorView = getWindow().getDecorView();
            decorView
                    .setOnSystemUiVisibilityChangeListener(new View.OnSystemUiVisibilityChangeListener()
                    {

                        @Override
                        public void onSystemUiVisibilityChange(int visibility)
                        {
                            if((visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0)
                            {
                                decorView.setSystemUiVisibility(flags);
                            }
                        }
                    });
        }

    }
    private void setActivitySize(boolean isFullScreen){
        if(isFullScreen) {
            mContentView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LOW_PROFILE
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_IMMERSIVE
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
            this.requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN);
        }
        else{

        }
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        context = this;
        setFullScreen();
        lastScan = System.currentTimeMillis();
        //setHasOptionsMenu(false);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);

        setContentView(R.layout.activity_home);
        setProgressBarIndeterminateVisibility(true);
        setProgressBarVisibility(true);
        mContentView = findViewById(R.id.framcontainer);
        prg = (ProgressBar) findViewById(R.id.progressBar);
        prg.setVisibility(View.GONE);


        customViewContainer = (FrameLayout) findViewById(R.id.customViewContainer);

        setActivitySize(false);
        /*ActionBar actionBar = getActionBar();
        if (actionBar != null) {
            actionBar.hide();
        }
*/
        if((Build.VERSION.SDK_INT>Build.VERSION_CODES.LOLLIPOP_MR1)) {
            verifyStoragePermissions(this);
        }


        final ImageView menuimage = (ImageView) findViewById(R.id.showmenu);
        menuimage.setVisibility(View.GONE);
        menuimage.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //Creating the instance of PopupMenu
                PopupMenu popup = new PopupMenu(Home.this, menuimage);
                //Inflating the Popup using xml file
                setForceShowIcon(popup);

                popup.getMenuInflater()
                        .inflate(R.menu.manimenu, popup.getMenu());
                //registering popup with OnMenuItemClickListener
                popup.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                    public boolean onMenuItemClick(MenuItem item) {
                        // Handle item selection
                        switch (item.getItemId()) {
                            case R.id.scanner:
                                openScanner();
                                return true;
                            case R.id.GoHomePage:
                                goHomePage();
                                return true;
                            case R.id.print:
                                PrintPage();
                                return true;
                            case R.id.settings2:
                                openSettings();
                                return true;
                            case R.id.GoBack:
                                goforward();
                                return true;
                            case R.id.GoForward:
                                gobackward();
                                return true;
                            case R.id.Refresh:
                                myWebView.reload();
                                return true;
                            case R.id.About:
                                showAboutDilog();
                                return true;
                            case R.id.exit:
                                Home.this.finish();
                                return true;
                            default:
                                return true;
                        }

                    }
                });

                popup.show(); //showing popup menu
            }
        });


        myWebView = (WebView) findViewById(R.id.webView);

        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        //webSettings.setAppCacheEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);

/*      webSettings.setSupportMultipleWindows(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setDisplayZoomControls(false);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);*/

        myWebView.addJavascriptInterface(new JavaScriptInterface(this, myWebView), "android");
        myWebView.getSettings().setUserAgentString(myWebView.getSettings().getUserAgentString() + " // Android // and piisoft Agent // balloonpop // ");


        myWebView.setWebViewClient(new WebViewClient() {


            @Override
            public boolean shouldOverrideUrlLoading(WebView view,  WebResourceRequest request) {
                if (request.getUrl().toString().startsWith("balloonpop://")) {
                    Toast.makeText(getApplicationContext(), "Custom protocol call balloonpop:// ", Toast.LENGTH_LONG).show();
                    return true;
                }

                return super.shouldOverrideUrlLoading(view, request);

            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request,   WebResourceError error) {
                //view.loadUrl("file:///android_asset/www/error.html");
                Toast.makeText(getApplicationContext(), "Error:" + error.getDescription(), Toast.LENGTH_LONG).show();
                Log.e("piisoft-d", request.getUrl().toString() + error.getDescription() + error.getErrorCode() );
                super.onReceivedError(view, request, error);
            }



        });


        myWebView.setDownloadListener(new DownloadListener() {

            public void onDownloadStart(String url, String userAgent,
                                        String contentDisposition, String mimetype,
                                        long contentLength) {
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));

                request.setMimeType(mimetype);
                //------------------------COOKIE!!------------------------
                String cookies = CookieManager.getInstance().getCookie(url);
                request.addRequestHeader("cookie", cookies);
                //------------------------COOKIE!!------------------------
                request.addRequestHeader("User-Agent", userAgent);
                request.setDescription("Downloading file...");
                request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype));
                request.allowScanningByMediaScanner();
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, URLUtil.guessFileName(url, contentDisposition, mimetype));
                DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                dm.enqueue(request);
                Toast.makeText(getApplicationContext(), "Downloading File", Toast.LENGTH_LONG).show();
            }


            /*
            public void onDownloadStart(String url, String userAgent,
                                        String contentDisposition, String mimetype,
                                        long contentLength) {
                DownloadManager.Request request = new DownloadManager.Request(
                        Uri.parse(url));

                request.allowScanningByMediaScanner();
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED); //Notify client once download is completed!
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, getFileNameFromURL(url));
                DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                dm.enqueue(request);
                Toast.makeText(getApplicationContext(), "Downloading File", //To notify the Client that the file is being downloaded
                        Toast.LENGTH_LONG).show();

            }*/
        });
        final Activity activity = this;

        mWebChromeClient = new MyWebChromeClient();
        myWebView.setWebChromeClient(mWebChromeClient);


        // Check whether we're recreating a previously destroyed instance
        if (savedInstanceState != null) {
            // Restore the previous URL and history stack
            myWebView.restoreState(savedInstanceState);
        }

        preferences = PreferenceManager.
                getDefaultSharedPreferences(this);
        // Load the local index.html file
        if (myWebView.getUrl() == null) {
            myWebView.loadUrl(mainUrl);
        }
        initilizeBarcodeScaner();
        hideEmededBarcode();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
    }

    private  void initilizeBarcodeScaner(){
        beepManager = new BeepManager(this);
        barcodeScannerView = findViewById(R.id.zxing_barcode_scanner);
        /*capture = new CaptureManager(this, barcodeScannerView);
        capture.initializeFromIntent(getIntent(), savedInstanceState);
        capture.setShowMissingCameraPermissionDialog(true);*/
        barcodeScannerView.decodeContinuous(callback);
    }

    private void showEmededBarcode(){
        int marginInDp = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 150, getResources().getDisplayMetrics());
        LayoutParams  lp = (FrameLayout.LayoutParams) myWebView.getLayoutParams();
        lp. setMargins(0,marginInDp,0,0);
        myWebView.setLayoutParams(lp);
        barcodeScannerView.setVisibility(View.VISIBLE);
    }

    private void hideEmededBarcode(){
        LayoutParams  lp = (FrameLayout.LayoutParams) myWebView.getLayoutParams();
        lp. setMargins(0,0,0,0);
        myWebView.setLayoutParams(lp);
        barcodeScannerView.setVisibility(View.GONE);
    }


    private BarcodeCallback callback = new BarcodeCallback() {
        @Override
        public void barcodeResult(BarcodeResult result) {
            if(result.getText() == null || ( result.getText().equals(lastText) && lastScan > (System.currentTimeMillis()-3000))) {
                // Prevent duplicate scans
                return;
            }
            lastScan = System.currentTimeMillis();
            lastText = result.getText();
            Toast.makeText(getApplicationContext(),lastText , Toast.LENGTH_SHORT).show();
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
                myWebView.evaluateJavascript("showBarcodeResult('" + lastText + "');", null);
            } else {
                myWebView.loadUrl("javascript:showBarcodeResult('" + lastText + "');");
            }
            beepManager.playBeepSoundAndVibrate();

        }

        @Override
        public void possibleResultPoints(List<ResultPoint> resultPoints) {
        }
    };



    private class RemoveCookiesThread extends Thread {
        private final ValueCallback<Boolean> mCallback;

        public RemoveCookiesThread(ValueCallback<Boolean> callback) {
            mCallback = callback;
        }

        public void run() {
            Looper.prepare();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                CookieManager.getInstance().removeAllCookies(mCallback);
                CookieManager.getInstance().removeSessionCookies(null);
            } else {
                CookieSyncManager cookieSyncManager = CookieSyncManager.createInstance(context);
                cookieSyncManager.startSync();
                CookieManager.getInstance().removeAllCookie();
                cookieSyncManager.stopSync();
                mCallback.onReceiveValue(true);

            }

            Looper.loop();
        }
    }

    public void showDialog() {

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Please enter the unlock password ");
        builder.setCancelable(false);
// Set up the input
        final EditText input = new EditText(this);
// Specify the type of input expected; this, for example, sets the input as a password, and will mask the text
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        builder.setView(input);

// Set up the buttons
        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String user_text = (input.getText()).toString();
                String fakepassword = preferences.getString("fakePassword", "0000");
                String password = preferences.getString("loclPassword", "");
                if (user_text.equals(fakepassword) || errorcounts > 2) {
                    RemoveCookiesThread thread = new RemoveCookiesThread(null);
                    thread.start();
                    myWebView.clearCache(true);
                    myWebView.clearFormData();
                    myWebView.clearHistory();
                    //myWebView.getSettings().setAppCacheMaxSize(1);

                    dialog.dismiss();
                    return;

                }
                if (user_text.equals(password)) {
                    dialog.dismiss();
                } else {
                    errorcounts++;
                    //Log.d(user_text, "string is empty");
                    String message = "The password you have entered is incorrect." + " \n \n" + "Please try again!";
                    AlertDialog.Builder builder2 = new AlertDialog.Builder(context);
                    builder2.setTitle("Error");
                    builder2.setMessage(message);
                    builder2.setPositiveButton("Cancel",new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int id) {
                            dialog.dismiss();
                            finish();
                        }
                    });
                    builder2.setNegativeButton("Retry", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int id) {
                            showDialog();
                        }
                    });
                    builder2.show();

                }
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel();
                finish();
            }
        });

        builder.show();

        /*


        final AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(context);

        final EditText userInput = new EditText(this);
        userInput.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        alertDialogBuilder.setView(userInput);
        // set dialog message
        /*
        alertDialogBuilder
                .setCancelable(false)
                .setNegativeButton("Go",
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog,int id) {
                                /** DO THE METHOD HERE WHEN PROCEED IS CLICKED*/
        // String user_text = (userInput.getText()).toString();

        /** CHECK FOR USER'S INPUT **
         if (user_text.equals("oeg"))
         {
         Log.d(user_text, "HELLO THIS IS THE MESSAGE CAUGHT :)");


         }
         else{
         Log.d(user_text,"string is empty");
         String message = "The password you have entered is incorrect." + " \n \n" + "Please try again!";
         AlertDialog.Builder builder = new AlertDialog.Builder(context);
         builder.setTitle("Error");
         builder.setMessage(message);
         builder.setPositiveButton("Cancel", null);
         builder.setNegativeButton("Retry", new DialogInterface.OnClickListener() {
        @Override public void onClick(DialogInterface dialog, int id) {
        showDialog();
        }
        });
         builder.create().show();

         }
         }
         })
         .setPositiveButton("Cancel",
         new DialogInterface.OnClickListener() {
         public void onClick(DialogInterface dialog,int id) {
         dialog.dismiss();
         }

         }

         );
         */
        //alertDialogBuilder.create().show();


    }


    public static void setForceShowIcon(PopupMenu popupMenu) {
        try {
            Field[] fields = popupMenu.getClass().getDeclaredFields();
            for (Field field : fields) {
                if ("mPopup".equals(field.getName())) {
                    field.setAccessible(true);
                    Object menuPopupHelper = field.get(popupMenu);
                    Class<?> classPopupHelper = Class.forName(menuPopupHelper
                            .getClass().getName());
                    Method setForceIcons = classPopupHelper.getMethod(
                            "setForceShowIcon", boolean.class);
                    setForceIcons.invoke(menuPopupHelper, true);
                    break;
                }
            }
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }


    /**
     * More info this method can be found at
     * http://developer.android.com/training/camera/photobasics.html
     *
     * @return
     * @throws IOException
     */
    private File createImageFile() throws IOException {
        // Create an image file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_PICTURES);
        File imageFile = File.createTempFile(
                imageFileName,  /* prefix */
                ".jpg",         /* suffix */
                storageDir      /* directory */
        );
        return imageFile;
    }


    /**
     * Convenience method to set some generic defaults for a
     * given WebView
     *
     * @param webView
     */
    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    private void setUpWebViewDefaults(WebView webView) {
        WebSettings settings = webView.getSettings();

        // Enable Javascript
        settings.setJavaScriptEnabled(true);

        // Use WideViewport and Zoom out if there is no viewport defined
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        // Enable pinch to zoom without the zoom buttons
        settings.setBuiltInZoomControls(true);

        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.HONEYCOMB) {
            // Hide the zoom controls for HONEYCOMB+
            settings.setDisplayZoomControls(false);
        }

        // Enable remote debugging via chrome://inspect
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }


        // We set the WebViewClient to ensure links are consumed by the WebView rather
        // than passed to a browser if it can
        myWebView.setWebViewClient(new WebViewClient());
    }


    private String getFileNameFromURL(String url) {
        String fileName = new Random(1000000) + "_file";
        int slashIndex = url.lastIndexOf("/");
        int qIndex = url.lastIndexOf("?");
        if (qIndex > slashIndex) {//if has parameters
            fileName = url.substring(slashIndex + 1, qIndex);
        } else {
            fileName = url.substring(slashIndex + 1);
        }
        if (fileName.contains(".")) {
            fileName = fileName.substring(0, fileName.lastIndexOf("."));
        }

        return fileName;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        //capture.onDestroy();

    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        //capture.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {

        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);

        if (result != null) {
            if (result.getContents() == null) {
                //Log.d("MainActivity", "Cancelled scan");
                Toast.makeText(this, "Cancelled", Toast.LENGTH_LONG).show();
            } else {
                //Log.d("MainActivity", "Scanned");
                Toast.makeText(this, "Scanned: " + result.getContents(), Toast.LENGTH_LONG).show();
                String format = data.getStringExtra("SCAN_RESULT_FORMAT");

                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
                    /*myWebView.evaluateJavascript("showBarcodeResult('" + result.getContents()
                            .replace("\n","<br>").replace("\r","").replace("<br><br>","<br>") + "');", null);*/
                    myWebView.evaluateJavascript("showBarcodeResult('" + result.getContents() + "');", null);
                } else {
                   /* myWebView.loadUrl("javascript:showBarcodeResult('" + result.getContents()
                            .replace("\n","<br>").replace("\r","").replace("<br><br>","<br>") + "');");*/
                    myWebView.loadUrl("javascript:showBarcodeResult('" + result.getContents() + "');");
                }

                if (result.getContents().contains("balloonpop://")) {
                    mainUrl = result.getContents().replace("balloonpop://", "http://");//.replace(":8009", ".local:8009");
                    SharedPreferences.Editor editor = preferences.edit();
                    //editor.putString("external_server", mainUrl);
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.GINGERBREAD) {
                        editor.apply();
                    } else {
                        editor.commit();
                    }
                    //goHomePage();
                    new GetComputerIp().execute(result.getContents().replace("balloonpop://", "").replace(":8009", "").toLowerCase());


                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
                        myWebView.evaluateJavascript("insertIntoLinks('" + mainUrl + "', '" + mainUrl + "');", null);
                    } else {
                        myWebView.loadUrl("javascript:insertIntoLinks('" + mainUrl + "', '" + mainUrl + "');");
                    }




                }
            }
        } else {
            // This is important, otherwise the result will not be passed to the fragment
            super.onActivityResult(requestCode, resultCode, data);
        }


        if (requestCode != INPUT_FILE_REQUEST_CODE || mFilePathCallback == null) {
            super.onActivityResult(requestCode, resultCode, data);
            return;
        }

        Uri[] results = null;

        // Check that the response is a good one
        if (resultCode == Activity.RESULT_OK) {
            if (data == null) {
                // If there is not data, then we may have taken a photo
                if (mCameraPhotoPath != null) {
                    results = new Uri[]{Uri.parse(mCameraPhotoPath)};
                }
            } else {
                String dataString = data.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
        }

        mFilePathCallback.onReceiveValue(results);
        mFilePathCallback = null;
        return;
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            switch (keyCode) {
                case KeyEvent.KEYCODE_BACK:
                    if (mCustomView != null)
                        mWebChromeClient.onHideCustomView();
                    else if (myWebView.canGoBack()) {
                        myWebView.goBack();
                    } else {
                        AlertDialog.Builder builder = new AlertDialog.Builder(this);
                        builder.setMessage(R.string.confirmExit)
                                .setCancelable(false)
                                .setPositiveButton(R.string.Yes, new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int id) {
                                        Home.this.finish();
                                    }
                                })
                                .setNegativeButton(R.string.No, new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int id) {
                                        dialog.cancel();
                                    }
                                });
                        AlertDialog alert = builder.create();
                        alert.show();
                    }
                    return true;
            }

        }
        return super.onKeyDown(keyCode, event);
    }


    @Override
    public void onBackPressed() {
        if (myWebView.canGoBack() && !myWebView.getUrl().contains("index.html")) {
            myWebView.goBack();
        } else {
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setMessage(R.string.confirmExit)
                    .setCancelable(false)
                    .setPositiveButton(R.string.Yes, new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int id) {
                            Home.this.finish();
                        }
                    })
                    .setNegativeButton(R.string.No, new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int id) {
                            dialog.cancel();
                        }
                    });
            AlertDialog alert = builder.create();
            alert.show();
        }
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        setActivitySize(false);
        //capture.onSaveInstanceState(outState);
    }


    @Override
    public void onStart() {
        super.onStart();
        setActivitySize(false);
        Context context = this;
        String password = preferences.getString("loclPassword", "");
        if (!password.equals("")) {
            showDialog();
        }



    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {

        setActivitySize(false);
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.manimenu, menu);
        return true;
    }


    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.scanner:
                openScanner();
                return true;
            case R.id.GoHomePage:
                goHomePage();
                return true;
            case R.id.print:
                PrintPage();
                return true;
            case R.id.settings2:
                openSettings();
                return true;
            case R.id.GoBack:
                goforward();
                return true;
            case R.id.GoForward:
                gobackward();
                return true;
            case R.id.Refresh:
                myWebView.reload();
                return true;
            case R.id.About:
                showAboutDilog();
                return true;
            case R.id.exit:
                Home.this.finish();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void goHomePage() {
        myWebView.loadUrl(mainUrl);
    }


    public class MyWebChromeClient extends WebChromeClient {


        private Bitmap mDefaultVideoPoster;
        private View mVideoProgressView;

        @Override
        public void onShowCustomView(View view, int requestedOrientation, CustomViewCallback callback) {
            onShowCustomView(view, callback);    //To change body of overridden methods use File | Settings | File Templates.
        }

        @Override
        public void onShowCustomView(View view, CustomViewCallback callback) {

            // if a view already exists then immediately terminate the new one
            if (mCustomView != null) {
                callback.onCustomViewHidden();
                return;
            }

            mCustomView = view;
            myWebView.setVisibility(View.GONE);
            customViewContainer.setVisibility(View.VISIBLE);
            RelativeLayout.LayoutParams COVER_SCREEN_GRAVITY_CENTER = new RelativeLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT);
            customViewContainer.addView(view);
            customViewCallback = callback;
        }

        @Override
        public View getVideoLoadingProgressView() {

            if (mVideoProgressView == null) {
                LayoutInflater inflater = LayoutInflater.from(Home.this);
                mVideoProgressView = inflater.inflate(R.layout.video_progress, null);
            }
            return mVideoProgressView;
        }

        @Override
        public void onHideCustomView() {
            super.onHideCustomView();    //To change body of overridden methods use File | Settings | File Templates.

            if (mCustomView == null)
                return;

            myWebView.setVisibility(View.VISIBLE);
            customViewContainer.setVisibility(View.GONE);

            // Hide the custom view.
            mCustomView.setVisibility(View.GONE);

            // Remove the custom view from its container.
            customViewContainer.removeView(mCustomView);
            customViewCallback.onCustomViewHidden();

            mCustomView = null;
        }

        public void onProgressChanged(WebView view, int progress) {
            // Activities and WebViews measure progress with different scales.
            // The progress meter will automatically disappear when we reach 100%
            //  prg.setProgress(progress * 100);
            prg.setVisibility(View.VISIBLE);
            prg.setProgress(progress);

            if (progress >= 100) {
                prg.setVisibility(View.GONE);
            }
            //Log.e("manai", "" + progress);

        }


        public boolean onShowFileChooser(
                WebView webView, ValueCallback<Uri[]> filePathCallback,
                WebChromeClient.FileChooserParams fileChooserParams) {
            if (mFilePathCallback != null) {
                mFilePathCallback.onReceiveValue(null);
            }
            mFilePathCallback = filePathCallback;

            Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
                // Create the File where the photo should go
                File photoFile = null;
                try {
                    photoFile = createImageFile();
                    takePictureIntent.putExtra("PhotoPath", mCameraPhotoPath);
                } catch (IOException ex) {
                    // Error occurred while creating the File
                   // Log.e("Mohamed ", "Unable to create Image File", ex);
                }

                // Continue only if the File was successfully created
                if (photoFile != null) {
                    mCameraPhotoPath = "file:" + photoFile.getAbsolutePath();
                    takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT,
                            Uri.fromFile(photoFile));
                } else {
                    takePictureIntent = null;
                }
            }

            Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
            contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
            contentSelectionIntent.setType("image/*");

            Intent[] intentArray;
            if (takePictureIntent != null) {
                intentArray = new Intent[]{takePictureIntent};
            } else {
                intentArray = new Intent[0];
            }

            Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
            chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
            chooserIntent.putExtra(Intent.EXTRA_TITLE, "Image Chooser");
            chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);

            startActivityForResult(chooserIntent, INPUT_FILE_REQUEST_CODE);

            return true;
        }
    }


    public class JavaScriptInterface {
        Context mContext;
        WebView webView1;

        /**
         * Instantiate the interface and set the context
         */
        JavaScriptInterface(Context c, WebView webView) {
            mContext = c;
            webView1 = webView;
        }



        @JavascriptInterface
        public void tryActivate(String Email) {
            new Installation(mContext).tryActivate(Email + "");
        }

        @JavascriptInterface
        public String getDeviceId() {
            return new Installation(mContext).id(mContext);
        }

        @JavascriptInterface
        public long remaningTime() {
            return  new Installation(mContext).remaningTime(mContext);
        }



        @JavascriptInterface
        public void print() {
            Toast.makeText(mContext, "Printing Please wait ..", Toast.LENGTH_SHORT).show();
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    createWebPrintJob(webView1);
                }
            });



        }

        @JavascriptInterface
        public void print2() {
            Toast.makeText(mContext, "please Use The Menu Button To Print", Toast.LENGTH_SHORT).show();

        }

        @JavascriptInterface
        public String getServers() {
            return preferences.getString("external_server", "");

        }

        @JavascriptInterface
        public void setPassword(String password) {
            SharedPreferences.Editor editor = preferences.edit();
            editor.putString("loclPassword", password);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.GINGERBREAD) {
                editor.apply();
            } else {
                editor.commit();
            }
            Toast.makeText(mContext, "The password have been set to : " + password , Toast.LENGTH_SHORT).show();
        }


        @JavascriptInterface
        public void setFakePassword(String password) {
            SharedPreferences.Editor editor = preferences.edit();
            editor.putString("fakePassword", password);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.GINGERBREAD) {
                editor.apply();
            } else {
                editor.commit();
            }
            Toast.makeText(mContext, "The fake password have been set to : " + password , Toast.LENGTH_SHORT).show();
        }

        @JavascriptInterface
        public void showToast(String toast) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
        }

        @JavascriptInterface
        public void openScanner() {
            //this from https://github.com/journeyapps/zxing-android-embedded
            IntentIntegrator integrator = new IntentIntegrator((Activity) mContext);
            integrator.setDesiredBarcodeFormats(IntentIntegrator.ALL_CODE_TYPES);
            integrator.addExtra("isFromWeb","0");
            integrator.setPrompt("Studio Scanner");
            integrator.setCameraId(0);  // Use a specific camera of the device
            integrator.setBeepEnabled(true);
            integrator.setBarcodeImageEnabled(false);
            integrator.initiateScan();
        }

        @JavascriptInterface
        public void openScanner(String fromWeb) {
            //this from https://github.com/journeyapps/zxing-android-embedded
            IntentIntegrator integrator = new IntentIntegrator((Activity) mContext);
            integrator.setDesiredBarcodeFormats(IntentIntegrator.ALL_CODE_TYPES);
            integrator.addExtra("isFromWeb","1");
            integrator.setPrompt("Studio Scanner fromWeb");
            integrator.setCameraId(0);  // Use a specific camera of the device
            integrator.setBeepEnabled(true);
            integrator.setBarcodeImageEnabled(false);
            integrator.initiateScan();
        }

        @JavascriptInterface
        public void showEmbededScaner() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    showEmededBarcode();
                }
            });

        }

        @JavascriptInterface
        public void hideEmbededScaner() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    hideEmededBarcode();
                }
            });

        }




        /*
        private void createWebPrintJob(WebView webView) {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                printManager.print(webView.getTitle(), webView.createPrintDocumentAdapter(), new PrintAttributes.Builder().build());
            } else {
                Toast.makeText(getApplicationContext(), "Please Update Yor adnroid version dosn't support printing ", Toast.LENGTH_LONG).show();

            }
        }
        */
    }

    public void PrintPage() {
        createWebPrintJob(myWebView);
    }

    private void createWebPrintJob(WebView webView) {

        // Get a PrintManager instance
        PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
        String jobName = getString(R.string.app_name) + webView.getTitle();

        // Get a print adapter instance
        PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter(jobName);

        // Create a print job with name and adapter instance
        PrintJob printJob = printManager.print(jobName, printAdapter,
                new PrintAttributes.Builder().build());
    }

    /*

    private void createWebPrintJob(WebView webView) {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
            printManager.print(webView.getTitle(), webView.createPrintDocumentAdapter(), new PrintAttributes.Builder().build());
        } else {
            Toast.makeText(getApplicationContext(), "Please Update Yor adnroid version dosn't support printing ", Toast.LENGTH_LONG).show();

        }
    }
    */

    private void openScanner() {
        //this from https://github.com/journeyapps/zxing-android-embedded
        IntentIntegrator integrator = new IntentIntegrator(this);
        integrator.setDesiredBarcodeFormats(IntentIntegrator.ALL_CODE_TYPES);
        integrator.setPrompt("Studio Scanner");
        integrator.setCameraId(0);  // Use a specific camera of the device
        integrator.setBeepEnabled(true);
        integrator.setBarcodeImageEnabled(false);
        integrator.initiateScan();
    }

    private void openSettings() {

    }


    private void gobackward() {
        // TODO Auto-generated method stub
        myWebView.goBack();
    }

    private void goforward() {
        // TODO Auto-generated method stub
        myWebView.goForward();
    }

    private void showAboutDilog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setMessage("We are small company based in middle-east we provide free \n" +
                "Apps for both Android and iOS , All our free Apps is free of adds , pop-ups , \n" +
                "any things that may harm the user device .\n" +
                "Phone : +966556553984\n" +
                "Email : info@piisoft.com\n" +
                "Website : piisoft.com\n")
                .setCancelable(false)
                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.cancel();
                    }
                });
        AlertDialog alert = builder.create();
        alert.show();
    }


    class GetComputerIp extends AsyncTask<String, Void, Void> {

        @Override
        protected Void doInBackground(String... computerName) {
            try {
                //InetAddress address = InetAddress.getByName(result.getContents().replace("balloonpop://","").replace(":8009","").toLowerCase());
                java.net.InetAddress[] x = java.net.InetAddress.getAllByName(computerName[0]);
                mainUrl = "http://" + x[0].getHostAddress() + ":8009/";
            } catch (Exception e) {
                e.printStackTrace();
                //Log.e("mohamed", "cant resolve: " + computerName[0]);

            }
            SharedPreferences.Editor editor = preferences.edit();
            //editor.putString("external_server", mainUrl);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.GINGERBREAD) {
                editor.apply();
            } else {
                editor.commit();
            }

            return null;
        }


        protected void onPostExecute(String address) {
            // TODO: check this.exception
            // TODO: do something with the feed
        }
    }


}
